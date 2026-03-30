import vikeReact from 'vike-react/config'
import Head from './+Head'

export default {
  // https://vike.dev/extends
  extends: [vikeReact],
  // Custom global head elements (Fonts, Icons, Favicon)
  Head, 
  // https://vike.dev/ssr
  ssr: true, // Enable full SSR to get static content in HTML
  // https://vike.dev/prerender
  prerender: true
}
