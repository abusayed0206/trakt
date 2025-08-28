// Server initialization - preload image index
import ImageIndexManager from '@/lib/imageIndex';

// Pre-load image index on server startup
console.log('🚀 Initializing server...');
console.time('Image index preload');

try {
  const imageManager = ImageIndexManager.getInstance();
  imageManager.loadImageIndex();
  console.timeEnd('Image index preload');
  console.log('✅ Image index preloaded successfully');
} catch (error) {
  console.error('❌ Failed to preload image index:', error);
}

export {}; // Make this a module
