"""Offline checks of the sync scripts: pagination, rebuilt stats, skipping unchanged data and images (no network, no real API keys)."""
import os
from unittest import mock

os.environ.setdefault('TRAKT_API_KEY', 'test_key')
import fetch_trakt_data


def fake_get(pages, fail_page=None):
    def get(url, headers=None, params=None):
        page = (params or {}).get('page', 1)
        r = mock.Mock(status_code=500 if page == fail_page else 200)
        r.headers = {'X-Pagination-Page-Count': str(len(pages))}
        # Like Trakt with extended=progress, out-of-range pages repeat the last page instead of []
        r.json.return_value = pages[min(page, len(pages)) - 1]
        r.raise_for_status.side_effect = (
            fetch_trakt_data.requests.exceptions.HTTPError('500') if page == fail_page else None)
        return r
    return get


with mock.patch.object(fetch_trakt_data.TraktUserDataClient, 'create_directory_structure'):
    client = fetch_trakt_data.TraktUserDataClient()

with mock.patch('requests.get', fake_get([[1, 2], [3, 4], [5]])):
    assert client.make_request('/x', {'extended': 'progress'}, paginate=True) == [1, 2, 3, 4, 5]
    assert client.make_request('/x') == [1, 2]

with mock.patch('requests.get', fake_get([[1, 2], [3]], fail_page=2)):
    assert client.make_request('/x', paginate=True) is None

with mock.patch('requests.get') as get:
    get.return_value = mock.Mock(status_code=200, headers={}, **{'json.return_value': [7]})
    assert client.make_request('/x', paginate=True) == [7]  # no pagination headers -> single page
    assert get.call_args.kwargs['params'] == {'page': 1, 'limit': 250}
    get.return_value = mock.Mock(status_code=204, headers={}, content=b'')
    assert client.make_request('/x') is None  # 204 No Content (VIP-only stats)

previous = {'movies': {'watched': 1, 'ratings': 16}, 'network': {'friends': 1}}
stats = fetch_trakt_data.build_stats(
    previous,
    [{'plays': 2, 'movie': {'runtime': 100}}, {'plays': 1, 'movie': {'runtime': None}}],
    [{'show': {'runtime': 30}, 'seasons': [{'episodes': [{'plays': 1}, {'plays': 3}]}]},
     {'show': {}}],  # no seasons, no runtime
)
assert stats['movies'] == {'watched': 2, 'plays': 3, 'minutes': 200, 'ratings': 16}
assert stats['shows'] == {'watched': 2}
assert stats['episodes'] == {'plays': 4, 'watched': 2, 'minutes': 120}
assert stats['network'] == {'friends': 1} and previous['movies']['watched'] == 1  # kept, not mutated

import json
import tempfile
from pathlib import Path

os.environ.setdefault('TMDB_API_KEY', 'test_key')
import download_media

with tempfile.TemporaryDirectory() as tmp:
    tmp = Path(tmp)

    # save_json leaves a file with unchanged data (and its fetched_at) alone
    client.data_dir, client.changed = tmp, False
    client.save_json([1], 'a.json')
    assert client.changed
    client.changed = False
    before = (tmp / 'a.json').read_text()
    client.save_json([1], 'a.json')
    assert not client.changed and (tmp / 'a.json').read_text() == before

    # The downloader only asks TMDB about images that aren't on disk
    downloader = download_media.MediaDownloader(cdn_repo_path=str(tmp / 'cdn'))
    downloader.media_index_path = tmp / 'media_index.json'
    for f in ('movies/posters/1_poster.jpg', 'movies/backdrops/1_backdrop.jpg'):
        (downloader.images_dir / f).touch()
    with mock.patch.object(downloader, 'make_tmdb_request', return_value=None) as tmdb:
        downloader.download_movie_images(1)
        assert tmdb.call_count == 0
        downloader.download_movie_images(2)
        assert tmdb.call_count == 1

    # English / text-free images win over a foreign-language one listed first
    with mock.patch.object(downloader, 'download_image') as dl:
        downloader.download_first([{'file_path': '/pt.jpg', 'iso_639_1': 'pt'}, {'file_path': '/en.jpg', 'iso_639_1': 'en'}], 'poster', tmp / 'x.jpg')
        downloader.download_first([{'file_path': '/pt.jpg', 'iso_639_1': 'pt'}], 'poster', tmp / 'y.jpg')
        assert [c.args[0].rsplit('/', 1)[1] for c in dl.call_args_list] == ['en.jpg', 'pt.jpg']

    # The media index (and its last_updated) is only rewritten when the file set changes
    downloader.create_media_index()
    first = downloader.media_index_path.read_text()
    downloader.create_media_index()
    assert downloader.media_index_path.read_text() == first
    (downloader.images_dir / 'movies/posters/2_poster.jpg').touch()
    downloader.create_media_index()
    assert json.loads(downloader.media_index_path.read_text())['movies']['posters'] == ['1_poster.jpg', '2_poster.jpg']

print('sync tests ok')
