import { useEffect } from 'react';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GenericElements } from 'Components/GenericElements';
import { HomeDealsItem } from 'Components/Items/HomeDealsItem';
import { useGetHomeDealsListQuery } from 'Redux/api/deals';
import { IDeal } from 'Redux/apiInterfaces';
import { useMediaQuery } from 'react-responsive';
import { Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import '../../../../node_modules/swiper/swiper-bundle.min.css';
import { tokenErrorHandler } from '../../../helpers/tokenErrorHandler';
import { useAppDispatch, useAppSelector } from 'Redux/hooks';
import { useLazyRefreshQuery, useSignoutMutation } from 'Redux/api/auth';
import styles from './dealswidget.module.sass';

export function DealsWidget() {
  const authState = useAppSelector(state => state.auth)
  
  const { data = [], isLoading, isSuccess, isError, error, refetch} = useGetHomeDealsListQuery(authState.authUserRoleId === 1 
    ? {mode: 'byManager', id: authState.authUserId || 1}
    : {mode: 'all'}
  )
  const isMobile = useMediaQuery({ query: '(max-width: 740px)' })
  
  const dispatch = useAppDispatch()
  const [signout] = useSignoutMutation()
  const [refresh] = useLazyRefreshQuery()
  const navigate = useNavigate()
  useEffect(() => {
      async function tokenError() {    
        if (isError && 'status' in error && (error.status === 401 || error.status === 403)) {
              const response = await tokenErrorHandler({error, dispatch, signout, authUserId:authState.authUserId, refresh})
              response ? refetch() : navigate('/login')
          }
      }
      tokenError()
  }, [isError, error])


  return (
    <section className={styles.dealswidget}>
      <div className={styles.container}>
        <div className={styles.dealswidget__titleWrapper}>
          <h2 className={styles.dealswidget__title}>Последние сделки</h2>
          <Link to='/deals' className={styles.dealswidget__goToPageLink}>
            Все
            <FontAwesomeIcon icon={faChevronRight} />
          </Link>
        </div>
        {isLoading && <p className={styles.dealswidget__msg}>Загрузка...</p>}
        {isError && 'status' in error && (error.status === 401 || error.status === 403) &&
          <p className={styles.dealswidget__msg}>Обновляем Access токен. Повторно получаем данные для этого виджета.</p>
        }
        {isError && 'status' in error && error.status !== 401 && error.status !== 403 &&
          <p className={styles.dealswidget__msg}>Не получилось загрузить данные для этого виджета</p>
        }
        {isSuccess && data && 'items' in data && !isMobile &&
          <ul className={styles.dealswidget__list}>
            <GenericElements<IDeal> list={data.items} Template={HomeDealsItem}/>
          </ul>
        }
        {isSuccess && data && 'items' in data && isMobile &&
          // этот безымянный div нужен чтобы Swiper не находился напрямую в flex-блоке
          <div>
            <Swiper 
              slidesPerView={1}
              autoplay={{delay: 2000, disableOnInteraction: false}} 
              modules={[Autoplay]}
              loop
              spaceBetween={10}
            >
              {/* компонент GenericElements тут не подходит так как все слайды оказываются под блоком swiper-wrapper */}
              {data.items.map((item) => 
                <SwiperSlide key={item.id}>
                  <HomeDealsItem {...item} />
                </SwiperSlide>
              )}
            </Swiper>
          </div>
        }
      </div>
    </section>
  );
}