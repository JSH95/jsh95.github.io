import handleChangePass from "../calcul/utils/passwordChange";
import {useEffect} from "react";
import createAxiosInstance from "../config/api";

function UserMyPage() {
    const handlePassword = (id) => {
        handleChangePass(id);  // id를 전달하여 비밀번호 변경 창을 엽니다.
    }

    useEffect(() => {
        const handlePasswordChange = async (event) => {
            if (event.data.type === 'changePassword') {
                const {password, id} = event.data;
                try{
                    const axiosInstance = createAxiosInstance(); // 인스턴스 생성
                    await axiosInstance.post('/employees/password', null,{
                        headers: {
                            "id": id,
                            "password": password,
                        }
                    })
                    alert('비밀번호가 변경되었습니다.');
                    window.location.reload(); // 부모 창 새로고침
                }catch (err) {
                    // console.error('비밀번호 변경 중 오류 발생:', err);
                    alert('비밀번호 변경 중 오류가 발생했습니다.');
                }
            }
        };
        window.addEventListener('message', handlePasswordChange);
        return () => {
            window.removeEventListener('message', handlePasswordChange);
        };
    }, []);

  return (
    <div>
      <h1>My Page</h1>
      <p>My Page contents</p>
    </div>
  );
}