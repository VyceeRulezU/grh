import vikeReact from 'vike-react/config'
import Head from './+Head'

export default {
  // https://vike.dev/extends
  extends: [vikeReact],
  // Custom global head elements (Fonts, Icons, Favicon)
  Head, 
  title: 'Governance Resource Hub | Excellence Redefined',
  description: 'A premium, unified platform for governance excellence — featuring interactive e-learning, a digital research library, AI-powered insights, and advanced institutional diagnostics.',
  image: 'https://www.governanceresourcehub.com/grh-learn.webp',
  // https://vike.dev/ssr
  ssr: true, // Enable full SSR to get static content in HTML
  // https://vike.dev/prerender
  prerender: true
}
