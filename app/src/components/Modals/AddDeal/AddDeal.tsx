import { useEffect, useRef } from 'react';
import { useCreateDealMutation } from 'Redux/api/deals';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faHurricane } from '@fortawesome/free-solid-svg-icons';
import { TNotifications } from 'Components/Content';
import { InputField } from 'Components/Forms/Fields/InputField';
import { SelectField } from 'Components/Forms/Fields/SelectField';
import { RichTextField } from 'Components/Forms/Fields/RichTextField';
import { useAppDispatch, useAppSelector } from 'Redux/hooks';
import { modalSwitch } from 'Redux/slices/modalSwitcherSlice';
import { tokenErrorHandler } from '../../../helpers/tokenErrorHandler';
import { ISelect, TForm, TInputShort } from 'Components/Forms/types';
import { SubmitHandler, useForm } from 'react-hook-form'
import { useLazyRefreshQuery, useSignoutMutation } from 'Redux/api/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './adddeal.module.sass';

type TProps = {
    setNotifications: React.Dispatch<React.SetStateAction<TNotifications>>
}

export function AddDeal({setNotifications}:TProps) {
    const [ createDeal, {isLoading: isCreateDealLoading, isError: isCreateDealError, error: createDealError} ] = useCreateDealMutation()

    const location = useLocation()
    const authState = useAppSelector(state => state.auth)

    const dispatch = useAppDispatch()
    const modalRef = useRef(null);
    function modalClose() { 
       dispatch(modalSwitch({open: false, modalName: '', itemId: null}))
    }
    
    const { register, handleSubmit, setValue, getValues, watch, formState: {errors} } = useForm<TForm>()
    const managerValue = watch('manager')
    // очистка поля с клиентом при смене менеджера (для админов и руководителей)
    useEffect(() => {
        setValue('client', null)
    },[managerValue])

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
    ]

    const currencySelects:ISelect = {
        listType: 'currencies',
        title: 'Валюта сделки',
        name: 'currency',
        checklist: {required: requiredCommonMsg}
    }
    
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

    const selects:ISelect[] = []

    if (authState.authUserRoleId !== 1) {
        location.pathname.includes('deals') 
            ? selects.push(currencySelects, managerSelect, clientSelect)
            : selects.push(currencySelects)
    }
    if (authState.authUserRoleId === 1) {
        location.pathname.includes('deals')
            ? selects.push(currencySelects, clientSelect)
            : selects.push(currencySelects)
    }   

    const onSubmit: SubmitHandler<TForm> = async (data) => {        
        const id_client = location.pathname.includes('deals')
            ? data.client?.value || 1
            : parseInt(location.pathname.substring(location.pathname.lastIndexOf('/') + 1), 10)
        const createResponse = await createDeal({
            id_client,
            title: data.title,
            description: data.description,
            sum: data.sum,
            currency: data.currency?.value || 1,
            status: 1,
            completion_date: null
        })
        if (createResponse.data && 'newDealId' in createResponse.data) {
            modalClose()
            setNotifications({show: true, status: true, text: 'Создана новая сделка'})
        }
    }

    const [signout] = useSignoutMutation()
    const [refresh] = useLazyRefreshQuery()
    const navigate = useNavigate()
    useEffect(() => {
        async function errorHandler() {
            if (isCreateDealError && createDealError && 'status' in createDealError) {
                if (createDealError.status === 401 || createDealError.status === 403) {
                    const response = await tokenErrorHandler({error: createDealError, dispatch, signout, authUserId:authState.authUserId, refresh})
                    response ? handleSubmit(onSubmit) : navigate('/login')
                } else {
                    setNotifications({show: true, status: false, text: `Произошла ошибка при создании новой сделки: ${createDealError}`})
                }
            }
        }
        errorHandler()
    },[isCreateDealError, createDealError])

    return (
        <div className={styles.addDeal} ref={modalRef}>
            <button className={styles.addDeal__closeBtn} onClick={modalClose}>
                <FontAwesomeIcon icon={faClose} />
            </button>
            <h2 className={styles.addDeal__title}>Добавление новой сделки</h2>
            <form className={styles.addDeal__form} autoComplete='on' onSubmit={handleSubmit(onSubmit)}>                                
                {inputs.map((input, index) => <InputField
                    key={index} 
                    title={input.title}
                    name={input.name}
                    placeholder={input.placeholder}
                    reg={register}
                    checklist={input.checklist}
                    errors={errors}
                />)}
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
                />)}
                <RichTextField
                    title="Описание сделки"
                    name="description"
                    checklist={{}}
                    reg={register}
                    setValue={setValue}
                    errors={errors}
                />
                <div className={styles.addDeal__formBtns}>
                    <button className={styles.addDeal__submitBtn} type='submit'>
                        Сохранить
                        {isCreateDealLoading && <FontAwesomeIcon icon={faHurricane} spin />}
                    </button>
                </div>               
            </form>
        </div>
    )
}