import React, { useRef } from 'react';
import { View, Image, StyleSheet, Text, ScrollView } from 'react-native';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import globalStyles from '../globalStyles';
import colors from '../theme.json';
import { isPortrait } from '../responsivenessHelpers';
import { connect } from 'react-redux';



const styles = StyleSheet.create({
    section: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    content: {
        width: '100%',
        paddingHorizontal: 25,
        marginTop: 30,
        marginBottom: 20,
    },
    title: {
        color: colors.lightdark,
        marginBottom: 15
    },
    image: {
        width: '100%',
        height: 350,
        borderRadius: 3,
        //paddingTop: '100%'

    },
    imageContainer: {
        width: `100%`,
        maxHeight: 550,
        flex: 1,
        alignItems: 'center',
        margin: 20,
    }
})

const ProfileImages = ({
    t,
    images,
    isPictures,
    isSign,
    dimensions
}) => {
    const scrollViewRef = useRef();
    let { width, height } = dimensions
    return (
        <>
            {!!images && (
                <View style={styles.section}>
                    <View style={styles.content}>
                        {!!isSign && (
                            <>
                                <Text style={[globalStyles.h3, styles.title]}>
                                    {t('views.family.sign').toUpperCase()}
                                </Text>
                                <View style={{
                                    alignItems: 'center'
                                }}>
                                    <View style={[styles.imageContainer, { maxWidth: isPortrait({ width, height }) ? null : 250 }]}>
                                        <Image
                                            style={styles.image}
                                            source={{ uri: images }}
                                            resizeMode='contain'
                                        />
                                    </View>
                                </View>

                            </>
                        )}
                        {!!isPictures && (
                            <>
                                <Text style={[globalStyles.h3, styles.title]}>
                                    {t('views.family.pictures').toUpperCase()}
                                </Text>
                                <ScrollView
                                    horizontal
                                    snapToAlignment="center"
                                    snapToInterval={width - (1 / 10) * width}
                                    contentContainerStyle={{
                                        width: isPortrait({ width, height }) ? `${90 * images.length}%` : 180 * images.length,
                                        flexGrow: 1,
                                        flexDirection: 'row',
                                        flexWrap: 'wrap',
                                        //justifyContent: 'space-between',
                                        padding: '0.66%',
                                        marginBottom: 20
                                    }}
                                    ref={scrollViewRef}
                                >
                                    {images.map((picture, i) => (
                                        <View
                                            key={i}
                                            style={[styles.imageContainer, { maxWidth: isPortrait({ width, height }) ? null : 250 }]}
                                        >
                                            <Image
                                                key={i}
                                                style={styles.image}
                                                source={{ uri: picture.content }}
                                            />

                                        </View>
                                    ))}
                                </ScrollView>
                            </>
                        )}
                    </View>
                </View>
            )
            }
        </>
    )
}

const mapStateToProps = ({ dimensions }) => ({
    dimensions
})

ProfileImages.propTypes = {
    images: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    t: PropTypes.func.isRequired,
    isPictures: PropTypes.bool,
    isSign: PropTypes.bool
}

export default withNamespaces()(connect(mapStateToProps)(ProfileImages));

