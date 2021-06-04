import React, { Component } from 'react'
import { Platform } from 'react-native'
import FullWidthImage from 'react-native-fullwidth-image'
import PropTypes from 'prop-types'

import ReactNativeBlobUtil from 'react-native-blob-util'

let dirs = ReactNativeBlobUtil.fs.dirs

export class CachedImage extends Component {
  getProperSourceForOS(source) {
    return Platform.OS === 'android' ? 'file://' + source : '' + source
  }

  render() {
    const { style, source } = this.props

    return (
      <FullWidthImage
        style={style}
        resizeMode="cover"
        ratio={1}
        source={{
          uri: this.getProperSourceForOS(
            `${dirs.DocumentDir}/${source.replace(/https?:\/\//, '')}`
          )
        }}
      />
    )
  }
}

CachedImage.propTypes = {
  source: PropTypes.string,
  style: PropTypes.object
}

export default CachedImage