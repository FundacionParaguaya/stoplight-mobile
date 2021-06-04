import { cacheImages, getSurveys, filterURLsFromSurveys } from '../cache'
import * as store from '../redux/store'
import ReactNativeBlobUtil from 'react-native-blob-util'

const surveyTestData = [
  {
    surveyStoplightQuestions: [
      {
        stoplightColors: [
          {
            url: 'url1.jpg'
          },
          {
            url: 'url2.jpg'
          }
        ]
      }
    ]
  }
]

store.default.getState = () => ({
  surveys: surveyTestData
})

describe('image cache', () => {
  it('getSurveys fetches raw survey data', () => {
    expect(getSurveys()).toEqual(surveyTestData)
  })
  it('filterURLsFromSurveys extracts the urls', () => {
    expect(filterURLsFromSurveys(surveyTestData)).toEqual([
      'url1.jpg',
      'url2.jpg'
    ])
  })
  it('cacheImages checks every image if it exists in the cache first', () => {
    cacheImages(['url1.jpg', 'url2.jpg'])
    expect(ReactNativeBlobUtil.fs.exists).toHaveBeenCalledTimes(1)
  })
})
