module.exports = {
  // options...
  // publicPath: "/hundred-family-surnames/",
  publicPath: process.env.NODE_ENV === 'production' ? './hundred-family-surnames/' : "/",
}