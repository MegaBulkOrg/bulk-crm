import { useEffect, useRef } from 'react';
import { useGetCurrentNoteQuery, useUpdateNoteMutation } from 'Redux/api/notes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faHurricane } from '@fortawesome/free-solid-svg-icons';
import { TNotifications } from 'Components/Content';
import { IUpdateNoteRequestBody } from 'Redux/apiInterfaces';
import { InputField } from 'Components/Forms/Fields/InputField';
import { RichTextField } from 'Components/Forms/Fields/RichTextField';
import { useAppSelector, useAppDispatch } from 'Redux/hooks';
import { modalSwitch } from 'Redux/slices/modalSwitcherSlice';
import { TForm } from 'Components/Forms/types';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useLazyRefreshQuery, useSignoutMutation } from 'Redux/api/auth';
import { tokenErrorHandler } from '../../../helpers/tokenErrorHandler';
import styles from './updatenote.module.sass';

type TProps = {
    setNotifications: React.Dispatch<React.SetStateAction<TNotifications>>
}

export function UpdateNote({setNotifications}:TProps) {
    const updatedNoteId = useAppSelector(state => state.modalSwitcher.itemId)
    const authState = useAppSelector(state => state.auth)

    const { data: updatedNoteData, isSuccess: isUpdatedNoteDataSuccess, isError: isUpdatedNoteDataError, error: updatedNoteDataError, refetch: refetchUpdatedNoteData } = useGetCurrentNoteQuery(updatedNoteId || 0)
    const [ updateNote, {isLoading: isUpdateNoteLoading, isError: isUpdateNoteError, error: updateNoteError} ] = useUpdateNoteMutation()

    const dispatch = useAppDispatch()
    const modalRef = useRef(null);
    function modalClose() { 
       dispatch(modalSwitch({open: false, modalName: '', itemId: null}))
    }
    
    const { register, handleSubmit, setValue, formState: {errors} } = useForm<TForm>()
    
    useEffect(() => {
        if (updatedNoteData && 'id' in updatedNoteData) {              
            setValue('title', updatedNoteData.title)

        }
    },[isUpdatedNoteDataSuccess])

    const requiredCommonMsg = 'Это поле обязательно для заполнения'

    const onSubmit: SubmitHandler<TForm> = async (data) => {                
        const dataToSend:IUpdateNoteRequestBody = {
            title: data.title,
            content: data.content
        }
        const updResponse = await updateNote({
            id: updatedNoteId || 1,
            body: dataToSend
        })
        if (updResponse.data && 'status' in updResponse.data && updResponse.data.status === true ) {
            modalClose()
            setNotifications({show: true, status: true, text: 'Запись обновлена'})
        }
    }

    const [signout] = useSignoutMutation()
    const [refresh] = useLazyRefreshQuery()
    const navigate = useNavigate()
    useEffect(() => {
        async function errorHandler() {
            if (isUpdatedNoteDataError && updatedNoteDataError && 'status' in updatedNoteDataError) {
                if (updatedNoteDataError.status === 401 || updatedNoteDataError.status === 403) {
                    const response = await tokenErrorHandler({error: updatedNoteDataError, dispatch, signout, authUserId:authState.authUserId, refresh})
                    response ? refetchUpdatedNoteData() : navigate('/login')
                } else {
                    setNotifications({show: true, status: false, text: `Произошла ошибка при получении информации о записи: ${updatedNoteDataError}`})
                }
            }
            if (isUpdateNoteError && updateNoteError && 'status' in updateNoteError) {
                if (updateNoteError.status === 401 || updateNoteError.status === 403) {
                    const response = await tokenErrorHandler({error: updateNoteError, dispatch, signout, authUserId:authState.authUserId, refresh})
                    response ? handleSubmit(onSubmit) : navigate('/login')
                } else {
                    setNotifications({show: true, status: false, text: `Произошла ошибка при обновлении информации: ${updateNoteError}`})
                }
            }
        }
        errorHandler()
    },[
        isUpdatedNoteDataError, updatedNoteDataError,
        isUpdateNoteError, updateNoteError
    ])

    return (
        <div className={styles.updateNote} ref={modalRef}>
            <button className={styles.updateNote__closeBtn} onClick={modalClose}>
                <FontAwesomeIcon icon={faClose} />
            </button>
            <h2 className={styles.updateNote__title}>Редактирование записи</h2>
            <form className={styles.updateNote__form} autoComplete='on' onSubmit={handleSubmit(onSubmit)}>                                
                <InputField
                    title="Заголовок"
                    name="title"
                    placeholder="Заголовок"
                    reg={register}
                    checklist={{required: requiredCommonMsg}}
                    errors={errors}
                />
                <RichTextField
                    title="Содержание"
                    name="content"
                    checklist={{
                        required: requiredCommonMsg,
                        validate: (value: string) => value !== '<p><br></p>' || requiredCommonMsg}}
                    reg={register}
                    setValue={setValue}
                    {...(updatedNoteData && 'id' in updatedNoteData ? { initialValue: updatedNoteData.content} : {})}
                    errors={errors}
                />
                <div className={styles.updateNote__formBtns}>
                    <button className={styles.updateNote__submitBtn} type='submit'>
                        Сохранить
                        {isUpdateNoteLoading && <FontAwesomeIcon icon={faHurricane} spin />}
                    </button>
                </div>               
            </form>
        </div>
    )
}