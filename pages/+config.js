import vikeReact from 'vike-react/config'

export default {
  // https://vike.dev/extends
  extends: [vikeReact],
  // https://vike.dev/ssr
  ssr: true, // Enable full SSR to get static content in HTML
  // https://vike.dev/prerender
  prerender: true
}
