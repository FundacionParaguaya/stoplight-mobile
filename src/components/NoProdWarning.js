import React, {useEffect, useState} from 'react';

import Alert from './Alert';
import PropTypes from 'prop-types';
import  { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';

const PROD_ENV = 'production';

const NoProdWarning = ({env, t}) => {
    const [visible, setVisible] = useState(false);

    useEffect(()=>{
        if(env !== PROD_ENV){
            setVisible(true)
        }
    },[env])

    return(
        <React.Fragment>
            {visible && (
                <Alert
                    onClose={() => setVisible(false)}
                    severity='warning'
                    message={t('views.noProdWarning.message')}
                />
            )}
        </React.Fragment>
    )
}

const mapStateToProps = ({env}) => ({
    env
});

NoProdWarning.propTypes = {
    t:PropTypes.func,
    env: PropTypes.oneOf(['production', 'demo', 'testing', 'development']),
}

export default withNamespaces()(connect(mapStateToProps)(NoProdWarning));