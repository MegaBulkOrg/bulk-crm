import { useEffect, useState } from "react";
import { useGetDealsByCurrentUserQuery } from 'Redux/api/deals';
import { useGetCurrentUserQuery } from "Redux/api/users";
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import { faRub } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLazyRefreshQuery, useSignoutMutation } from "Redux/api/auth";
import { useAppDispatch, useAppSelector } from "Redux/hooks";
import { tokenErrorHandler } from '../../../helpers/tokenErrorHandler';
import styles from './totalprofitbycurrentuser.module.sass';

export function TotalProfitByCurrentUser() {
    const location = useLocation()
    const userId = location.pathname.slice(7)
    const { data, isSuccess, isError, error, refetch } = useGetDealsByCurrentUserQuery({id: Number(userId), sortDir: 'asc'})
    const { data: userInfo, isSuccess: isUserInfoSuccess, isError: isUserInfoError, error: userInfoError, refetch: refetchUserInfo } = useGetCurrentUserQuery(Number(userId))
    const [exchangeRates, setExchangeRates] = useState<any>()
    const [totalProfit, setTotalProfit] = useState(0)

    const [showProfit, setShowProfit] = useState(true)
    useEffect(() => {
        if (userInfo && 'id' in userInfo && userInfo.role !== 'manager') setShowProfit(false)
    },[isUserInfoSuccess])


    useEffect(() => {
        async function getRates() {
            const response = await axios.get('https://www.cbr-xml-daily.ru/daily_json.js')
            setExchangeRates(response)
        }
        getRates()
    },[])
    
    useEffect(() => {
        if(data && Array.isArray(data)) {
            const dealsDone = data.filter(deal => deal.status.id === 4)
            // проверка на пустой totalProfit нужна чтобы не задваивалась сумма прибыли
            // так как функция в useEffect может быть вызвана несколько раз
            if (exchangeRates && totalProfit === 0) {
                dealsDone.map(deal => {                
                    if (deal.currency.code !== 'RUB') {
                        const sum = deal.sum * exchangeRates.data.Valute[deal.currency.code].Value
                        setTotalProfit(prev => prev + sum)
                    } else {
                        setTotalProfit(prev => prev + deal.sum)
                    }
                })
            }
        }
    },[exchangeRates, data])
    
    const [signout] = useSignoutMutation()
    const [refresh] = useLazyRefreshQuery()
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const authUserId = useAppSelector(state => state.auth.authUserId)
    useEffect(() => {
        async function tokenError() {     
            if (isError && 'status' in error && (error.status === 401 || error.status === 403)) {
                const response = await tokenErrorHandler({error, dispatch, signout, authUserId, refresh})
                response ? refetch() : navigate('/login')
            }
            if (isUserInfoError && 'status' in userInfoError && (userInfoError.status === 401 || userInfoError.status === 403)) {
                const response = await tokenErrorHandler({error:userInfoError, dispatch, signout, authUserId, refresh})
                response ? refetchUserInfo() : navigate('/login')
            }
        }
        tokenError()
    }, [
        isError, error,
        isUserInfoError, userInfoError
    ])

    return (
        <div className={showProfit ? styles.userProfit : styles.userProfit__hideBlock}>
            {isError && 'status' in error && (error.status === 401 || error.status === 403) &&
                <p>Обновляем Access токен. Повторно получаем данные.</p>
            }
            {isError && 'status' in error && error.status !== 401 && error.status !== 403 &&
                <p>Не получилось загрузить данные</p>
            } 
            {isSuccess && totalProfit > 0 &&
                <p>Всего прибыли: {totalProfit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} <FontAwesomeIcon icon={faRub} /></p>
            }
            {isSuccess && totalProfit === 0 && <p>Пока нет завершенных сделок</p>}
        </div>
    );
}