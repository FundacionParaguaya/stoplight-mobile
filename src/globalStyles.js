import { Platform, StyleSheet } from 'react-native'
import colors from './theme.json'

export default StyleSheet.create({
  ViewMainContainer: {
    backgroundColor: colors.white,
    flex: 1
  },
  ScrollMainContainerNotCentered: {
    flexGrow: 0,
    backgroundColor: colors.white
  },
  ScrollMainContainerCentered: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: colors.white
  },
  background: {
    backgroundColor: colors.white
  },
  containerNoPadding: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 25
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 25,
    paddingTop: 48
  },

  h1: {
    ...Platform.select({
      ios: {
        fontFamily: 'Poppins',
        fontWeight: '600'
      },
      android: {
        fontFamily: 'Poppins SemiBold'
      }
    }),

    fontSize: 24
  },
  h2: {
    ...Platform.select({
      ios: {
        fontFamily: 'Poppins',
        fontWeight: '500'
      },
      android: {
        fontFamily: 'Poppins Medium'
      }
    }),
    fontSize: 18,
    lineHeight: 26
  },
  h2Bold: {
    ...Platform.select({
      ios: {
        fontFamily: 'Poppins',
        fontWeight: '600'
      },
      android: {
        fontFamily: 'Poppins SemiBold'
      }
    }),
    fontSize: 18,
    lineHeight: 27
  },
  h3: {
    ...Platform.select({
      ios: {
        fontFamily: 'Poppins',
        fontWeight: '500'
      },
      android: {
        fontFamily: 'Poppins Medium'
      }
    }),
    fontSize: 16,
    lineHeight: 20
  },
  h4: {
    ...Platform.select({
      ios: {
        fontFamily: 'Poppins',
        fontWeight: '500'
      },
      android: {
        fontFamily: 'Poppins Medium'
      }
    }),
    fontSize: 12
  },
  h5: {
    ...Platform.select({
      ios: {
        fontFamily: 'Poppins',
        fontWeight: '500'
      },
      android: {
        fontFamily: 'Poppins Medium'
      }
    }),
    fontSize: 12,
    color: colors.lightdark
  },
  p: {
    fontFamily: 'Roboto',
    fontSize: 16,
    lineHeight: 21,
    color: colors.lightdark
  },
  subline: {
    fontFamily: 'Roboto',
    fontSize: 14,
    lineHeight: 20,
    color: colors.grey
  },
  tag: {
    fontFamily: 'Roboto',
    fontSize: 12
  },
  centerText: {
    textAlign: 'center'
  }
})
