import { useState } from 'react';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TInputFull } from '../types';
import styles from './fields.module.sass';

export function InputField({ title, name, placeholder, reg, errors, checklist }:TInputFull) {
    const formGroupStyles = errors?.[name]
        ? `${styles.formGroup} ${styles.formGroupError}`
        : styles.formGroup
    
    let initialInputType = 'text'
    if (name === 'phone') initialInputType = 'tel'
    if (name === 'email') initialInputType = 'email'
    if (name === 'password') initialInputType = 'password'

    const [inputType, setInputType] = useState(initialInputType)

    function showPassword() {
        setInputType(prev => prev === 'password' ? 'text': 'password')
    }

    return (
        <div className={formGroupStyles}>
            <label className={styles.formLabel} htmlFor={name}>{title}</label>
            <input className={styles.formInput} 
                {...reg(name, checklist)}
                id={name}
                type={inputType}
                placeholder={placeholder}                
            />
            {name === 'password' &&
                <FontAwesomeIcon icon={faEye} className={styles.eye} onClick={showPassword}/>
            }
            {errors?.[name] &&
                <p className={styles.formInputErrorMsg}>
                    {errors[name]?.message}
                </p>
            }
        </div>
    )
}