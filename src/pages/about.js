import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

class AboutPage extends React.Component {
  render() {
    const { data } = this.props
    const siteTitle = data.site.siteMetadata.title

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO title="关于我" />
        <h1>关于我</h1>
        <p>主攻前端和 NodeJS 开发，6 年+前端开发经验，呆过大公司和小团队，从 0 组建 20 人前端 NodeJS 混合开发团队，带领团队利用最新技术解决业务快速发展过程中的各种业务场景问题。熟悉客户端开发，有多个上架 APP，有 Java 开发经验。</p>
      </Layout>
    )
  }
}

export default AboutPage

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
