import PropTypes from 'prop-types';
import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import Popup from './Popup';
import colors from '../theme.json';
import Icon from 'react-native-vector-icons/MaterialIcons'
import globalStyles from '../globalStyles';
import { withNamespaces } from 'react-i18next';
import { isLandscape, isPortrait } from '../responsivenessHelpers'
import IconButton from './IconButton';
import { isTablet } from 'react-native-device-info';


const ProjectsPopup = ({
    isOpen,
    toggleModal,
    t,
    projects,
    selectedSurvey,
    afterSelect
}) => {
    const onClose = (selected, project) => {
        selected ? afterSelect(selectedSurvey, project):toggleModal();
    };
    const dimensions = useWindowDimensions();
    // Styles based on screen size and orientation
    // Tablet Horizontal

    let projectsContainerStyle = styles.projectsScrollContainerHorizontal;
    let cardStyle = styles.itemCardHorizontal;
    let container = styles.container;
    let linkContainer = styles.linkContainer;
    if (!!dimensions && isTablet(dimensions) && isLandscape(dimensions)) {
        container = {
            ...container,
            justifyContent:'center',
            maxHeight: 400,
        }
        projectsContainerStyle =  { 
            ...styles.projectsScrollContainerHorizontal,
            paddingVertical: 10,
            paddingBottom:10
        
        };
        cardStyle = {
            ...styles.itemCard,
            width: 240,
            minWidth: 180,
            maxHeight: 150,
            minHeight: '100%',
            marginRight: 15
        }
    }
    // Tablet Vertical
    if (!!dimensions && isTablet(dimensions) && isPortrait(dimensions)) {
        projectsContainerStyle =  styles.projectsScrollContainerVertical;
        cardStyle = {
            ...styles.itemCard,
            width: 240,
            minWidth: 180,
            maxHeight: 200,
            minHeight: 200,
            marginBottom: 15,
            marginHorizontal: 10
        };
        linkContainer = {
            ...linkContainer,
            marginTop: 15
        }
    }
    // Phone Horizontal
    if (!!dimensions && !isTablet(dimensions) && isLandscape(dimensions)) {
        projectsContainerStyle = { 
            ...styles.projectsScrollContainerHorizontal,
            paddingBottom: 15
        }
        cardStyle = {
            ...styles.itemCard,
            width: 200,
            minWidth: 150,
            maxHeight: 200,
            height:'100%',
            minHeight: 100,
            marginRight: 15
        };
    }

    //Phone Vertical
    if (!!dimensions && !isTablet(dimensions) && isPortrait(dimensions)) {
        projectsContainerStyle = styles.projectsScrollContainerVertical;
        cardStyle = {
            ...styles.itemCard,
            width: 180,
            minWidth: 150,
            maxHeight: 200,
            minHeight: 150,
            marginBottom: 15,
            marginHorizontal: 10
        };
        linkContainer = {
            ...linkContainer,
            marginTop: 15
        }
    }

    return (
        <Popup isOpen={isOpen} onClose={() => onClose(false)} modifiedPopUp projectsModal>
            <View style={container} >

                <Icon
                    style={styles.closeIconStyle}
                    size={20}
                    name="close"
                    onPress={() => onClose(false)}
                />
                <>
                
                    <Text
                        style={styles.title}
                    >
                        {t('views.modals.chooseProjectTitle')}

                    </Text>
                    <Text
                        style={styles.subtitle}
                    >
                        {t('views.modals.chooseProjectSubtitle')}
                    </Text>

                    <ScrollView
                        horizontal={isLandscape(dimensions) ? true : false}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        snapToAlignment="center"
                        contentContainerStyle={projectsContainerStyle}
                    >
                        {projects.map(project => {
                            return (
                                <TouchableOpacity
                                    onPress={() => onClose(true, project.id)}
                                    key={project.id}
                                >
                                    <View style={[
                                        cardStyle,
                                        {
                                            backgroundColor: project.color
                                                ? project.color
                                                : '#fff'
                                        }]}
                                    >
                                        <Text style={styles.itemTitle} >{project.title}</Text>
                                        <Text style={styles.itemDescription}>{project.description}</Text>

                                    </View>

                                </TouchableOpacity>
                            )
                        })}
                    </ScrollView>
                </>

                <View style={linkContainer}>
                    <IconButton
                        text={t('views.modals.skipProject')}
                        textStyle={styles.link}
                        onPress={() => onClose(true)}

                    // onPress={() => this.selectAnswer(0)}
                    />
                </View>
        
                </View>
        </Popup>)
}

ProjectsPopup.propTypes = {
    isOpen: PropTypes.bool,
    toggleModal: PropTypes.func,
    ProjectsPopup: PropTypes.bool,
    projects: PropTypes.array,
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    afterSelect: PropTypes.func,
    selectedSurvey: PropTypes.object
}

const styles = StyleSheet.create({
    closeIconStyle: {
        color: colors.palegreen,
        marginLeft: 'auto',
        fontSize: 24,
    },
    container: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
    },
    title: {
        ...globalStyles.h2Bold,
        color: colors.lightdark,
        textAlign: 'center'
    },
    subtitle: {
        ...globalStyles.h4,
        color: colors.lightdark,
        textAlign: 'center',
        paddingBottom: 25,
    },
    projectsScrollContainerVertical: {
        minWidth: '100%',
        minHeight: '100%',
        alignItems: 'center',
        marginBottom: 50
    },
    projectsScrollContainerHorizontal: {
        minWidth: '100%',
        height: '100%',
        maxHeight: 230,
        alignItems: 'center',
        paddingHorizontal: 20
    },
    itemCard: {
        borderRadius: 2,
        paddingHorizontal: 15,
        paddingVertical: 30,
        marginHorizontal: 15,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,
        elevation: 7,
        maxWidth: 300,
    },
    itemTitle: {
        ...globalStyles.h3Bold,
        textAlign: 'center',
        paddingBottom: 15
    },
    itemDescription: {
        fontSize: 11,
        textAlign: 'center',
        fontFamily: 'Poppins Medium',
    },
    link: {
        ...globalStyles.h3Bold,
        color: colors.palegreen,
    },
    linkContainer: {
        marginRight: 20,
        marginLeft: 'auto',
    }
})

export default withNamespaces()(ProjectsPopup);