import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { InputField } from 'Components/Forms/Fields/InputField';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faHurricane } from '@fortawesome/free-solid-svg-icons';
import { useSigninMutation } from 'Redux/api/auth'
import { ISigninResponse } from 'Redux/apiInterfaces';
import { TForm, TInputShort } from 'Components/Forms/types';
import { useAppDispatch } from 'Redux/hooks';
import { changeAuthStatus } from 'Redux/slices/authSlice';
import { jwtVerify } from 'jose';
import { useNavigate } from 'react-router-dom';
import styles from './loginrightside.module.sass';

export function LoginRightSide() {  
  const { register, handleSubmit, formState: {errors} } = useForm<TForm>()

  const requiredCommonMsg = 'Это поле обязательно для заполнения'
  const [response, setResponse] = useState<ISigninResponse>({status: false, msg: ''})
  
  const inputs:TInputShort[] = [
    {
        title: 'E-mail',
        name: 'email',
        placeholder: 'asd@asd.ru',
        checklist: {
            required: requiredCommonMsg,
            pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: 'E-mail указан неправильно'
            }
        }
    },
    {
        title: 'Пароль',
        name: 'password',
        placeholder: '*****',
        checklist: {required: requiredCommonMsg}
    },
  ]

  const [signin, {isSuccess, isLoading}] = useSigninMutation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const onSubmit: SubmitHandler<TForm> = async (credentials) => {
    const { data } = await signin(credentials)
    if (data) setResponse(data)
    if (data && data.status && data.accessToken) {         
      // секретный ключ должен быть преобразован в формат Uint8Array
      const secretKey = new TextEncoder().encode(import.meta.env.VITE_REACT_JWT_ACCESS_SECRET);
      const { payload } = await jwtVerify(data.accessToken, secretKey)         
      dispatch(changeAuthStatus({
        isAuth: data.status,
        accessToken: data.accessToken,
        authUserId: Number(payload.userId),
        authUserRoleId: Number(payload.userRole)
      }))
      // navigate(-1)
      navigate('/')
    }
  }

  return (
    <div className={styles.loginrightside}>
      <p className={styles.loginrightside__title}>Авторизация в системе</p>
      <form className={styles.loginrightside__form} autoComplete='on' onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.loginrightside__form__fieldsWrapper}>
          {inputs.map((input, index) => <InputField 
            key={index} 
            title={input.title}
            name={input.name}
            placeholder={input.placeholder}
            reg={register}
            checklist={input.checklist}
            errors={errors}
          />)}
        </div>        
        <button className={styles.loginrightside__submitBtn} type='submit'>
          Войти
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
        {isLoading &&
          <FontAwesomeIcon className={styles.loginrightside__spinner} icon={faHurricane} spin />
        }
        {isSuccess && !response.status &&
          <p className={styles.loginrightside__authErrorMsg}>{response.msg}</p>
        }
      </form>
    </div>
  );
}