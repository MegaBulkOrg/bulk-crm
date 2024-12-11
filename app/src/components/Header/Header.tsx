import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import { faAdd, faArrowDownShortWide, faArrowLeft, faArrowUpWideShort, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import noAvatar from '/img/no_avatar.png';
import { MobileHeaderPanel } from 'Components/MobileHeaderPanel';
import { UsersListTemplateItemsSwitch } from 'Components/UsersList/UsersListTemplateItemsSwitch';
import { useAppDispatch, useAppSelector } from 'Redux/hooks';
import { changeSortDir } from 'Redux/slices/itemsListsSlice';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TotalProfitByCurrentUser } from './TotalProfitByCurrentUser';
import { modalSwitch } from 'Redux/slices/modalSwitcherSlice';
import { useGetCurrentUserQuery } from "Redux/api/users";
import { useLazyRefreshQuery, useSignoutMutation } from 'Redux/api/auth';
import { tokenErrorHandler } from "../../helpers/tokenErrorHandler";
import styles from './header.module.sass';

export function Header() {
  const [currentDate, setСurrentDate] = useState('')

  const authState = useAppSelector(state => state.auth)
  
  const navigate = useNavigate()
  const [searchRequest, setSearchRequest] = useState('')
  const [searchError, setSearchError] = useState(false)
  function handlerChange(event: ChangeEvent<HTMLInputElement>) {
    setSearchRequest(event.target.value);
  }
  const [searchInputClass, setSearchInputClass] = useState(`${styles.header__formField}`)
  function searchFormHandler(event: FormEvent) {
    event.preventDefault()
    if (searchRequest.length > 1) {
      setSearchError(false)
      setSearchInputClass(`${styles.header__formField}`)
      navigate(`/search?q=${searchRequest}`)
    } else {
      setSearchError(true)
      setSearchInputClass(prev => prev + ` ${styles.header__formErrorField}`)
    }
  }
  
  useEffect(() => {
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = months[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    setСurrentDate(`${day} ${month} ${year} года`);
  }, [])
  
  const location = useLocation();
  function addItem() {
    if (location.pathname === '/deals') dispatch(modalSwitch({open: true, modalName: 'addDeal', itemId: null}))
    if (location.pathname === '/clients') dispatch(modalSwitch({open: true, modalName: 'addClient', itemId: null}))
  }

  const isDesktop = useMediaQuery({ query: '(min-width: 1201px)' })
  const isBigTablet = useMediaQuery({ query: '(max-width: 1200px)' })
  const isMobile = useMediaQuery({ query: '(max-width: 740px)' })
  
  const sortDir = useAppSelector(state => state.itemsLists.sortby) || 'asc'
  const dispatch = useAppDispatch()
  function sortDirChange() {
    if(sortDir === 'asc') {
      dispatch(changeSortDir({sortby: 'desc'}))
    } else {
      dispatch(changeSortDir({sortby: 'asc'}))
    }
  }
  
  const pagesWithAddBtn = ['/deals','/clients']
  const pagesWithSortDirBtn = ['/deals','/clients','/users']
  const pagesWithCalendar = ['/','/users']

  const { data:userInfo, isLoading:isUserInfoLoading, isSuccess:isUserInfoSuccess, isError:isUserInfoError, error:userInfoError, refetch:userInfoRefetch } = useGetCurrentUserQuery(authState.authUserId || 0)
  const [signout] = useSignoutMutation()
  const [refresh] = useLazyRefreshQuery()
  useEffect(() => {
    async function tokenError() {    
      if (isUserInfoError && 'status' in userInfoError && (userInfoError.status === 401 || userInfoError.status === 403)) {
        const response = await tokenErrorHandler({error: userInfoError, dispatch, signout, authUserId:authState.authUserId, refresh})
        response ? userInfoRefetch() : navigate('/login')
      }
    }
    tokenError()
  }, [isUserInfoError, userInfoError])

  return (
    <header className={styles.header}>
      {!isMobile &&
        <div className={styles.header__up}>
          <form className={styles.header__form} onSubmit={searchFormHandler} autoComplete='on'>
            <FontAwesomeIcon icon={faMagnifyingGlass}  />
            <input className={searchInputClass} type='text' name='search' placeholder='Найти...' value={searchRequest} onChange={handlerChange} />
            {searchError && <p className={styles.header__form__searchErrorMsg}>Введите более 1 символа</p>}
          </form>
          <div className={styles.header__right}>
            {/* notifications icon */}
            <div className={styles.header__me}>
              {isUserInfoLoading && <span className={styles.header__meName}>Загрузка...</span>}
              {isUserInfoError && 'status' in userInfoError && (userInfoError.status === 401 || userInfoError.status === 403) &&
                <span className={styles.header__meName}>Обновляем Access токен. Повторно получаем данные пользователя.</span>
              }
              {isUserInfoError && 'status' in userInfoError && userInfoError.status !== 401 && userInfoError.status !== 403 &&
                <span className={styles.header__meName}>Не получилось загрузить данные пользователя</span>
              }
              {isUserInfoSuccess && 'id' in userInfo &&
                <>
                  <img className={styles.header__meAvatar} src={userInfo.avatar 
                    ? `http://${import.meta.env.VITE_REACT_APP_HOST}:${import.meta.env.VITE_REACT_API_PORT}/api/files/get-img/users/${userInfo.avatar}` 
                    : noAvatar} 
                  alt={userInfo.name} />
                  <span className={styles.header__meName}>{userInfo.name}</span>
                </>
              }
              {/* dropdown menu icon */}
            </div>
          </div>
        </div>
      }
      {isMobile && <MobileHeaderPanel />}
      <div className={styles.header__down}>
        {location.pathname === '/' && isUserInfoLoading && <p className={styles.header__helloText}>Загрузка...</p>}
        {location.pathname === '/' && isUserInfoError && 'status' in userInfoError && (userInfoError.status === 401 || userInfoError.status === 403) &&
          <p className={styles.header__helloText}>Обновляем Access токен. Повторно получаем данные пользователя.</p>
        }
        {location.pathname === '/' && isUserInfoError && 'status' in userInfoError && userInfoError.status !== 401 && userInfoError.status !== 403 &&
          <p className={styles.header__helloText}>Не получилось загрузить данные пользователя</p>
        }
        {location.pathname === '/' && isUserInfoSuccess && 'id' in userInfo &&
          <p className={styles.header__helloText}>Добро Пожаловать, {userInfo.name}!</p>
        }  
        {location.pathname !== '/' &&
          <Link to='/' className={styles.header__backToHome}><FontAwesomeIcon icon={faArrowLeft} />На Главную</Link>
        }

        <div className={styles.header__titleWrapper}>
          <h1></h1>
          
          {pagesWithAddBtn.includes(location.pathname) && !isMobile && !isDesktop &&
            <button className={styles.header__addButton} onClick={addItem}><FontAwesomeIcon icon={faAdd} />Добавить</button>
          }

          {location.pathname === '/users' && authState.authUserRoleId !== 1 &&
            <UsersListTemplateItemsSwitch 
          />}

          {pagesWithSortDirBtn.includes(location.pathname) && 
            <div className={styles.header__sortBtn} onClick={sortDirChange}>
              {sortDir === 'asc' ? <FontAwesomeIcon icon={faArrowDownShortWide} /> : <FontAwesomeIcon icon={faArrowUpWideShort} />}
            </div>
          }

          {pagesWithCalendar.includes(location.pathname) && 
            <div className={styles.header__date}><FontAwesomeIcon icon={faCalendar} />{currentDate}</div>
          }
          
          {pagesWithAddBtn.includes(location.pathname) && !isBigTablet && 
            <button className={styles.header__addButton} onClick={addItem}><FontAwesomeIcon icon={faAdd} />Добавить</button>
          }

          {location.pathname.startsWith('/users/') && location.pathname !== '/users/' && authState.authUserRoleId !== 1 &&
            <TotalProfitByCurrentUser />
          }
        </div>
      </div>
    </header>
  );
}