"""Offline check of TraktUserDataClient.make_request pagination (no network, no real API key)."""
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

print('pagination ok')
