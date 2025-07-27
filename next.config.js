/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for Plotly.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      }
    }
    
    // Plotly.js alias
    config.resolve.alias = {
      ...config.resolve.alias,
      'plotly.js-dist-min': 'plotly.js-dist-min'
    }
    
    return config
  }
}

module.exports = nextConfig
