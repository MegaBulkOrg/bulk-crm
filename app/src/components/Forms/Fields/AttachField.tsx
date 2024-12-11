import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { useRef } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { TForm } from '../types';
import styles from './fields.module.sass';

type TProps = {
    reg: UseFormRegister<TForm>
    watch: UseFormWatch<TForm>
    setValue: UseFormSetValue<TForm>
    initialValue?: string 
}

export function AttachField({ reg, watch, setValue, initialValue }: TProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const file = watch('file')

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) setValue('file', [files[0]])
    }

    return (
        <div className={styles.attach}>
            <button className={styles.attach__btn} onClick={() => fileInputRef.current?.click()} type="button">
                <FontAwesomeIcon icon={faPaperclip}  />
            </button>
            <input
                type='file'
                {...reg('file')}
                // ref указывается после register чтобы не быть им перезаписанным
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange} 
            />
            <p className={styles.attach__filename}>
                {!file && initialValue && initialValue}
                {file && file[0]?.name}
            </p>
        </div>
    )
}