import { useEffect, useRef } from 'react';
import { useGetCurrentDealQuery, useUpdateDealMutation } from 'Redux/api/deals';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faHurricane } from '@fortawesome/free-solid-svg-icons';
import { TNotifications } from 'Components/Content';
import { InputField } from 'Components/Forms/Fields/InputField';
import { SelectField } from 'Components/Forms/Fields/SelectField';
import { RichTextField } from 'Components/Forms/Fields/RichTextField';
import { useAppSelector, useAppDispatch } from 'Redux/hooks';
import { modalSwitch } from 'Redux/slices/modalSwitcherSlice';
import { tzDateStringToCommonDateStringForForms } from '../../../helpers/date';
import { tokenErrorHandler } from '../../../helpers/tokenErrorHandler';
import { ISelect, TForm, TInputShort } from 'Components/Forms/types';
import { SubmitHandler, useForm } from 'react-hook-form'
import { useLazyRefreshQuery, useSignoutMutation } from 'Redux/api/auth';
import { useNavigate } from 'react-router-dom';
import styles from './updatedeal.module.sass';
import { IUpdateDealRequestBody } from 'Redux/apiInterfaces';

type TProps = {
    setNotifications: React.Dispatch<React.SetStateAction<TNotifications>>
}

export function UpdateDeal({setNotifications}:TProps) {
    const updatedDealId = useAppSelector(state => state.modalSwitcher.itemId)
    const authState = useAppSelector(state => state.auth)
    
    const { data: updatedDealData, isSuccess: isUpdatedDealDataSuccess, isError: isUpdatedDealDataError, error: updatedDealDataError, refetch: refetchUpdatedDealData } = useGetCurrentDealQuery(updatedDealId || 1)
    const [ updateDeal, {isLoading: isUpdateDealLoading, isError: isUpdateDealError, error: updateDealError} ] = useUpdateDealMutation()
    
    const dispatch = useAppDispatch()
    const modalRef = useRef(null);
    function modalClose() { 
       dispatch(modalSwitch({open: false, modalName: '', itemId: null}))
    }
    
    const { register, handleSubmit, setValue, getValues, formState: {errors} } = useForm<TForm>()
    
    useEffect(() => {
        if (updatedDealData && 'id' in updatedDealData) {              
            setValue('title', updatedDealData.title)
            setValue('sum', updatedDealData.sum)
            setValue('completion_date', updatedDealData.completion_date !== null
                ? tzDateStringToCommonDateStringForForms(updatedDealData.completion_date)
                : ''
            )
        } 
    },[isUpdatedDealDataSuccess])
    
    const requiredCommonMsg = 'Это поле обязательно для заполнения'

    const inputs:TInputShort[] = [
        {
            title: 'Наименование сделки',
            name: 'title',
            placeholder: 'Сделка',
            checklist: {required: requiredCommonMsg}
        },        
        {
            title: 'Сумма',
            name: 'sum',
            placeholder: '0',
            checklist: {}
        },
        {
            title: 'Дата завершения',
            name: 'completion_date',
            placeholder: 'ГГГГ-ММ-ДД',
            checklist: {
                pattern: {
                    value: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[01])$/,
                    message: 'Дата завершения указана неправильно'
                }
            }
        }
    ]
    
    const selects:ISelect[] = [
        {
            listType: 'currencies',
            title: 'Валюта сделки',
            name: 'currency',
            initialValue: updatedDealData && 'id' in updatedDealData ? updatedDealData.currency.title : '',
            checklist: {required: requiredCommonMsg}
        },

        {
            listType: 'dealsStatuses',
            title: 'Статус',
            name: 'dealStatus',
            initialValue: updatedDealData && 'id' in updatedDealData ? updatedDealData.status.title : '',
            checklist: {required: requiredCommonMsg}
        }
    ]
    
    const onSubmit: SubmitHandler<TForm> = async (data) => {                
        // проверка №1
        if (data.dealStatus?.value === 4 && data.completion_date === '') {
            setNotifications({show: true, status: false, text: 'При завершении сделки необходимо указать дату завершения'})
            return
        }
        // если все проверки пройдены
        const dataToSend:IUpdateDealRequestBody = {
            title: data.title,
            description: data.description,
            sum: data.sum,
            currency: data.currency?.value || 1,
            status: data.dealStatus?.value || 1,
            completion_date: data.dealStatus?.value === 4
                ? data.completion_date
                : null
        }
        const updResponse = await updateDeal({
            id: updatedDealId || 1,
            body: dataToSend
        })
        if (updResponse.data && 'status' in updResponse.data && updResponse.data.status === true ) {
            modalClose()
            setNotifications({show: true, status: true, text: 'Информация о сделке обновлена'})
        }
    }

    const [signout] = useSignoutMutation()
    const [refresh] = useLazyRefreshQuery()
    const navigate = useNavigate()
    useEffect(() => {
        async function errorHandler() {
            if (isUpdatedDealDataError && updatedDealDataError && 'status' in updatedDealDataError) {
                if (updatedDealDataError.status === 401 || updatedDealDataError.status === 403) {
                    const response = await tokenErrorHandler({error: updatedDealDataError, dispatch, signout, authUserId:authState.authUserId, refresh})
                    response ? refetchUpdatedDealData() : navigate('/login')
                } else {
                    setNotifications({show: true, status: false, text: `Произошла ошибка при получении информации о сделке: ${updatedDealDataError}`})
                }
            }
            if (isUpdateDealError && updateDealError && 'status' in updateDealError) {
                if (updateDealError.status === 401 || updateDealError.status === 403) {
                    const response = await tokenErrorHandler({error: updateDealError, dispatch, signout, authUserId:authState.authUserId, refresh})
                    response ? handleSubmit(onSubmit) : navigate('/login')
                } else {
                    setNotifications({show: true, status: false, text: `Произошла ошибка при обновлении информации: ${updateDealError}`})
                }
            }
        }
        errorHandler()
    },[
        isUpdatedDealDataError, updatedDealDataError,
        isUpdateDealError, updateDealError
    ])

    return (
        <div className={styles.updateDeal} ref={modalRef}>
            <button className={styles.updateDeal__closeBtn} onClick={modalClose}>
                <FontAwesomeIcon icon={faClose} />
            </button>
            <h2 className={styles.updateDeal__title}>Редактирование информации о сделке</h2>
            <form className={styles.updateDeal__form} autoComplete='on' onSubmit={handleSubmit(onSubmit)}>                                
                <InputField
                    title={inputs[0].title}
                    name={inputs[0].name}
                    placeholder={inputs[0].placeholder}
                    reg={register}
                    checklist={inputs[0].checklist}
                    errors={errors}
                />
                <InputField
                    title={inputs[1].title}
                    name={inputs[1].name}
                    placeholder={inputs[1].placeholder}
                    reg={register}
                    checklist={inputs[1].checklist}
                    errors={errors}
                />
                {selects.map((select, index) => <SelectField 
                    key={index}
                    listType={select.listType}
                    title={select.title}
                    name={select.name}
                    initialValue={select.initialValue}
                    reg={register}
                    checklist={select.checklist}
                    setValue={setValue}
                    getValues={getValues}
                    errors={errors}
                />)}
                <InputField
                    title={inputs[2].title}
                    name={inputs[2].name}
                    placeholder={inputs[2].placeholder}
                    reg={register}
                    checklist={inputs[2].checklist}
                    errors={errors}
                />

                <RichTextField
                    title="Описание сделки"
                    name="description"
                    checklist={{}}
                    reg={register}
                    setValue={setValue}
                    {...(updatedDealData && 'id' in updatedDealData ? { initialValue: updatedDealData.description} : {})}
                    errors={errors}
                />
                <div className={styles.updateDeal__formBtns}>
                    <button className={styles.updateDeal__submitBtn} type='submit'>
                        Сохранить
                        {isUpdateDealLoading && <FontAwesomeIcon icon={faHurricane} spin />}
                    </button>
                </div>               
            </form>
        </div>
    )
}