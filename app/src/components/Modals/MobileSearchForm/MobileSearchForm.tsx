import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppDispatch } from 'Redux/hooks';
import { modalSwitch } from 'Redux/slices/modalSwitcherSlice';
import { ChangeEvent, FormEvent, MouseEvent, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './mobilesearchform.module.sass';

export function MobileSearchForm() {
    const navigation = useNavigate()
    const [searchRequest, setSearchRequest] = useState('')
    const [searchError, setSearchError] = useState(false)
    function handlerChange(event: ChangeEvent<HTMLInputElement>) {
        setSearchRequest(event.target.value);
    }
    const dispatch = useAppDispatch()
    const [searchFormClass, setSearchFormClass] = useState(`${styles.mobileSearchForm__form}`)
    function searchFormHandler(event: FormEvent) {
        event.preventDefault()
        if (searchRequest.length > 1) {
            setSearchError(false)
            setSearchFormClass(`${styles.mobileSearchForm__form}`)
            dispatch(modalSwitch({open: false, modalName: '', itemId: null}))
            navigation(`/search?q=${searchRequest}`)
        } else {
            setSearchError(true)
            setSearchFormClass(prev => prev + ` ${styles.mobileSearchForm__errorForm}`)
        }
    }

    const msfRef = useRef(null);
    function modalClose(e:MouseEvent<HTMLDivElement>) {
        if(e.target === msfRef.current) dispatch(modalSwitch({open: false, modalName: '', itemId: null}))
    }

    return (
        <div className={styles.mobileSearchForm} ref={msfRef} onClick={modalClose}>
            <form className={searchFormClass} onSubmit={searchFormHandler} autoComplete='on'>
                <input className={styles.mobileSearchForm__field} type='text' name='search' placeholder='Найти...' value={searchRequest} onChange={handlerChange} />
                <FontAwesomeIcon icon={faMagnifyingGlass}  />
                {searchError && <p className={styles.mobileSearchForm__searchErrorMsg}>Введите более 1 символа</p>}
            </form>
        </div>
    )
}