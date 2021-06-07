import { get } from "lodash";
import React from "react";


const getOtherOption = options => {
    if(!options.some(e => e.otherOption)) {
        return null;
    }
    return options.filter(e=>e.otherOption)[0].value;
};

const OtherOptionInput = ({
    dep,
    fieldOptions,
    children,
    target,
    cleanUp, 
    formik,
    question,
    isMultiValue
}) => {
    const otherOption = getOtherOption(fieldOptions);
    const values = formik.values[dep] || [];


    if(!isMultiValue) {

        const value = formik.values[dep];

        if(otherOption !== value && !!get(formik.values, target)) {
            cleanUp(value);
        }

        if(otherOption && value && !!question && !!formik  ) {

            return children(otherOption, value, formik, question);
        }
        return null
    } else {
        const values = formik.values[dep] || [];
        
        if(!values.find(v => v=== otherOption) && !!get(formik.values, target)) {
            cleanUp();
        }else {
      
            if(otherOption && !!values.find(v => v === otherOption) && !!formik && !!question) {
               
                return children(
                    otherOption,
                    values.find(v => v === otherOption),
                    formik, question
                );
            }
        }
        return null;
    }
}

export default OtherOptionInput;