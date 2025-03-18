
const handleChangePass = (id) => {
        const newWindow = window.open('', '_blank', 'width=400,height=400,left=200,top=200'); // 크기와 위치 지정
        newWindow.document.write(`
            <html lang="kr">
                <head>
                <title> '${id}' 비밀번호 변경</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
                </head>
                <body>
                <div class="card">
                    <div class="card-header">
                        <h1>비밀번호 변경</h1>
                    </div>
                    <div class="card-body">
                            <div class="mb-3 d-flex justify-content-between align-items-center">
                                <label for="password" class="form-label mb-0">비밀번호</label>
                                <input type="text" id="password" name="password" class="form-control w-50" 
                                maxlength="12"
                                />
                            </div>
                            <div class="mb-3 d-flex justify-content-between align-items-center">
                                <label for="password2" class="form-label mb-0">비밀번호 확인</label>
                                <input type="text" id="password2" name="password2" class="form-control w-50" 
                                maxlength="12"
                                />
                            </div>
                    </div>
                    <div class="card-footer">
                        <button id="changeBtn" class="btn btn-primary me-3">변경</button>
                        <button 
                            onclick="window.close()"
                            class="btn btn-secondary">닫기</button>
                    </div>
                </div>
                    <script>
                        document.getElementById('changeBtn').addEventListener('click', function() {
                             
                            const password = document.getElementById('password').value;
                            const password2 = document.getElementById('password2').value;
                            const onlyEngNumRegex = /^[A-Za-z0-9]+$/;
                            if (!onlyEngNumRegex.test(password)) {
                                 alert('비밀번호는 영어와 숫자만 입력 가능합니다.');
                            } else if(password.length < 8) {
                                 alert('비밀번호는 8자 이상 입력해 주세요.');
                            } else {
                                if (password === password2) {
                                    if (confirm('비밀번호를 변경하시겠습니까?')) {
                                        window.opener.postMessage(
                                            { 
                                                type: 'changePassword', 
                                                password: password,
                                                id: '${id}'
                                            },
                                         '*'
                                        );
                                        window.close(); // 현재 창 닫기
                                    }
                                } else if(password !== password2){
                                    alert('비밀번호를 정확하게 입력해 주세요.');
                                } else {
                                    alert('비밀번호를 입력해 주세요.');
                                }
                            }
                            
                        });
                    </script>
                </body>
            </html>
        `);
};

export default handleChangePass;