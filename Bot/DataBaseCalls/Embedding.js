import { pipeline } from '@xenova/transformers';

const generateEmbedding = async (text) => {
  const embed = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  const output = await embed(text, {
    pooling: 'mean', // mean pooling to get single vector
    normalize: true, // normalize vector length
  });

  return Array.from(output.data); // this is your Float32Array
};

export {generateEmbedding}