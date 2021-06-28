import React, {useEffect, useState} from 'react';

import Alert from './Alert';
import  { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';

const nodeEnv = 'production';

const NoProdWarning = ({env, t}) => {
    const [visible, setVisible] = useState(false);

    useEffect(()=>{
        if(env !== nodeEnv){
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

export default withNamespaces()(connect(mapStateToProps)(NoProdWarning));