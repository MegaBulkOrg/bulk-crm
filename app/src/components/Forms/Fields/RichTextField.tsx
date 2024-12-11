import { TForm } from '../types';
import ReactQuill from 'react-quill';
import { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { TCheckList } from 'Components/Forms/types';
import 'react-quill/dist/quill.snow.css';
import styles from './fields.module.sass';

type TProps= {
    title: string
    name: keyof TForm
    checklist: TCheckList
    reg: UseFormRegister<TForm>
    setValue: UseFormSetValue<TForm>
    initialValue?: string
    errors: FieldErrors<TForm>
}

export function RichTextField({title, name, checklist, reg, setValue, initialValue, errors}: TProps) {
    const formGroupStyles = errors?.[name]
        ? `${styles.formGroup} ${styles.formGroupError} form-select-error`
        : styles.formGroup
    
    return (
        <div className={formGroupStyles}>
            <label className={styles.formLabel} htmlFor={name}>{title}</label>
            <ReactQuill theme="snow" id={name}
                        onChange={value => setValue(name, value !== '<p><br></p>' ? value : '')}
                        {...(initialValue ? { defaultValue: initialValue} : {})}
            />
            <input {...reg(name, checklist)} type="hidden" />
            {errors?.[name] &&
                <p className={styles.formInputErrorMsg}>
                    {errors[name]?.message}
                </p>
            }
        </div>
    ) 
}