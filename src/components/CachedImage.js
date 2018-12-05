import React, { Component } from 'react'
import { Image, Platform, NetInfo } from 'react-native'
import PropTypes from 'prop-types'
import RNFetchBlob from 'rn-fetch-blob'

let dirs = RNFetchBlob.fs.dirs

export class CachedImage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      source: props.source
    }
  }
  getProperSourceForOS(source) {
    return Platform.OS === 'android' ? 'file://' + source : '' + source
  }
  checkIfCached() {}

  updateSource() {
    const { source } = this.props

    RNFetchBlob.fs
      .exists(`${dirs.DocumentDir}/${source.replace(/https?:\/\//, '')}`)
      .then(exist => {
        if (exist) {
          this.setState({
            source: this.getProperSourceForOS(
              `${dirs.DocumentDir}/${source.replace(/https?:\/\//, '')}`
            )
          })
        }
      })
  }
  componentDidMount() {
    this.updateSource()

    // add event on net change
    NetInfo.addEventListener('connectionChange', () => {
      this.updateSource()
    })
  }
  render() {
    const { source } = this.state
    const { style } = this.props

    return <Image style={style} source={{ uri: source }} />
  }
}

CachedImage.propTypes = {
  source: PropTypes.string,
  style: PropTypes.object
}

export default CachedImage
