import { useEffect, useRef } from 'react';
import { useCreateNoteMutation } from 'Redux/api/notes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faHurricane } from '@fortawesome/free-solid-svg-icons';
import { TNotifications } from 'Components/Content';
import { InputField } from 'Components/Forms/Fields/InputField';
import { SelectField } from 'Components/Forms/Fields/SelectField';
import { RichTextField } from 'Components/Forms/Fields/RichTextField';
import { useAppDispatch, useAppSelector } from 'Redux/hooks';
import { modalSwitch } from 'Redux/slices/modalSwitcherSlice';
import { ISelect, TForm } from 'Components/Forms/types';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useLazyRefreshQuery, useSignoutMutation } from 'Redux/api/auth';
import { tokenErrorHandler } from '../../../helpers/tokenErrorHandler';
import styles from './quickaddnote.module.sass';

type TProps = {
    setNotifications: React.Dispatch<React.SetStateAction<TNotifications>>
}

export function QuickAddNote({setNotifications}:TProps) {
    const [ createNote, {isLoading: isCreateNoteLoading, isError: isCreateNoteError, error: createNoteError} ] = useCreateNoteMutation()
    
    const authState = useAppSelector(state => state.auth)

    const dispatch = useAppDispatch()
    const modalRef = useRef(null);
    function modalClose() { 
       dispatch(modalSwitch({open: false, modalName: '', itemId: null}))
    }
    
    const { register, handleSubmit, setValue, getValues, watch, formState: {errors} } = useForm<TForm>()
    const managerValue = watch('manager')
    const clientValue = watch('client')
    // очистка поля с клиентом при смене менеджера (для админов и руководителей)
    useEffect(() => {
        setValue('client', null)
    },[managerValue])
    // очистка поля со сделкой при смене клиента (для админов и руководителей)
    useEffect(() => {
        setValue('deal', null)
    },[clientValue])

    const requiredCommonMsg = 'Это поле обязательно для заполнения'

    const managerSelect:ISelect = {
        listType: 'managers',
        title: 'Менеджер',
        name: 'manager',
        checklist: {required: requiredCommonMsg}
    }

    const clientSelect:ISelect = {
        listType: 'clients',
        title: 'Клиент',
        name: 'client',
        checklist: {required: requiredCommonMsg}
    }

    const dealSelect:ISelect = {
        listType: 'deals',
        title: 'Сделка',
        name: 'deal',
        checklist: {required: requiredCommonMsg}
    }

    const selects:ISelect[] = []

    authState.authUserRoleId === 1
        ? selects.push(clientSelect, dealSelect)
        : selects.push(managerSelect, clientSelect, dealSelect)

    const onSubmit: SubmitHandler<TForm> = async (data) => {                
        const createResponse = await createNote({
            id_deal: data.deal?.value || 1,
            title: data.title,
            content: data.content
        })
        if (createResponse.data && 'newNoteId' in createResponse.data) {
            modalClose()
            setNotifications({show: true, status: true, text: 'Создана новая запись'})
        }
    }

    const [signout] = useSignoutMutation()
    const [refresh] = useLazyRefreshQuery()
    const navigate = useNavigate()
    useEffect(() => {
        async function errorHandler() {
            if (isCreateNoteError && createNoteError && 'status' in createNoteError) {
                if (createNoteError.status === 401 || createNoteError.status === 403) {
                    const response = await tokenErrorHandler({error: createNoteError, dispatch, signout, authUserId:authState.authUserId, refresh})
                    response ? handleSubmit(onSubmit) : navigate('/login')
                } else {
                    setNotifications({show: true, status: false, text: `Произошла ошибка при создании новой записи: ${createNoteError}`})
                }
            }
        }
        errorHandler()
    },[isCreateNoteError, createNoteError])

    return (
        <div className={styles.quickAddNote} ref={modalRef}>
            <button className={styles.quickAddNote__closeBtn} onClick={modalClose}>
                <FontAwesomeIcon icon={faClose} />
            </button>
            <h2 className={styles.quickAddNote__title}>Добавление новой записи</h2>
            <form className={styles.quickAddNote__form} autoComplete='on' onSubmit={handleSubmit(onSubmit)}>                                
                <InputField
                    title="Заголовок"
                    name="title"
                    placeholder="Заголовок"
                    reg={register}
                    checklist={{required: requiredCommonMsg}}
                    errors={errors}
                />
                {selects.map((select, index) => <SelectField 
                    key={index}
                    listType={select.listType}
                    title={select.title}
                    name={select.name}
                    reg={register}
                    checklist={select.checklist}
                    setValue={setValue}
                    getValues={getValues}
                    errors={errors}
                    {...(select.name === 'client' ? { managerId: authState.authUserRoleId === 1
                        ? authState.authUserId || 1
                        : managerValue?.value || 1
                    } : {})}
                    {...(select.name === 'deal' 
                        ? { clientId: clientValue?.value || 1 } 
                        : {}
                    )}
                />)}
                <RichTextField
                    title="Содержание"
                    name="content"
                    checklist={{
                        required: requiredCommonMsg,
                        validate: (value: string) => value !== '<p><br></p>' || requiredCommonMsg
                    }}
                    reg={register}
                    setValue={setValue}
                    errors={errors}
                />
                <div className={styles.quickAddNote__formBtns}>
                    <button className={styles.quickAddNote__submitBtn} type='submit'>
                        Сохранить
                        {isCreateNoteLoading && <FontAwesomeIcon icon={faHurricane} spin />}
                    </button>
                </div>               
            </form>
        </div>
    )
}