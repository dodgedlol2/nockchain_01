/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Handle plotly.js imports
    config.resolve.alias = {
      ...config.resolve.alias,
      'plotly.js': 'plotly.js/dist/plotly.min.js',
    }
    return config
  }
}

module.exports = nextConfig
