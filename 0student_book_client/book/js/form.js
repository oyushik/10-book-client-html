//전역변수
const API_BASE_URL = 'http://localhost:8080';
//현재 수정중인 학생 ID
let editingBookId = null;

//DOM 엘리먼트 가져오기
const bookForm = document.getElementById('bookForm');
const bookTableBody = document.getElementById('bookTableBody');
const cancelButton = bookForm.querySelector('.cancel-btn');
const submitButton = bookForm.querySelector('button[type="submit"]');
const formError = document.getElementById('formError');

//Document Load 이벤트 처리하기
document.addEventListener('DOMContentLoaded', function () {
  loadBooks();
});

//Form Submit 이벤트 처리하기
bookForm.addEventListener('submit', function (event) {
  //기본으로 설정된 Event가 동작하지 않도록 하기 위함
  event.preventDefault();
  console.log('Form 제출 되었음...');

  //FormData 객체생성 <form>엘리먼트를 객체로 변환
  const bookFormData = new FormData(bookForm);
  // stuFormData.forEach((value, key) => {
  //     console.log(key + ' = ' + value);
  // });

  //사용자 정의 Student 객체생성 ( 공백 제거 )
  const bookData = {
    title: bookFormData.get('title').trim(),
    author: bookFormData.get('author').trim(),
    isbn: bookFormData.get('isbn').trim(),
    price: bookFormData.get('price').trim(),
    publishDate: bookFormData.get('publishDate').trim(),
    detailRequest: {
      language: bookFormData.get('language').trim(),
      pageCount: bookFormData.get('pageCount').trim(),
      publisher: bookFormData.get('publisher').trim(),
      coverImageUrl: bookFormData.get('coverImageUrl').trim(),
      edition: bookFormData.get('edition').trim(),
      description: bookFormData.get('description').trim(),
    },
  };

  //유효성 체크하기
  if (!validateBook(bookData)) {
    //검증체크 실패하면 리턴하기
    return;
  }
  //유효한 데이터 출력하기
  //console.log(bookData);

  //현재 수정중인 학생 ID가 있으면
  if (editingBookId) {
    //서버로 Student 수정 요청하기
    updateBook(editingBookId, bookData);
  } else {
    //서버로 Student 등록 요청하기
    createBook(bookData);
  }
});

//데이터 유효성을 체크하는 함수
function validateBook(book) {
  // 필수 필드 검사
  if (!book.title || !book.author || !book.isbn || !book.price) {
    showError('제목, 저자, ISBN, 가격은 필수 입력 항목입니다.');
    return false;
  }

  // ISBN 형식 검사 (정수로만 구성된 13자리 숫자)
  const isbnPattern = /^\d{13}$/;
  if (!isbnPattern.test(book.isbn)) {
    showError('ISBN은 13자리 숫자여야 합니다.');
    return false;
  }

  // 가격 형식 검사 (양의 정수 또는 0)
  const pricePattern = /^(0|[1-9]\d*)$/;
  if (!pricePattern.test(book.price)) {
    showError('가격은 0 이상의 정수여야 합니다.');
    return false;
  }

  return true;
} //validateBook

//학생목록 로드하는 함수
function loadBooks() {
  console.log('학생 목록 로드 중.....');
  fetch(`${API_BASE_URL}/api/books`) //Promise
    .then((response) => {
      if (!response.ok) {
        throw new Error('도서 목록을 불러오는데 실패했습니다!.');
      }
      return response.json();
    })
    .then((books) => renderBookTable(books))
    .catch((error) => {
      console.log('Error: ' + error);
      showError('도서 목록을 불러오는데 실패했습니다!.');
      bookTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: #dc3545;">
                        오류: 데이터를 불러올 수 없습니다.
                    </td>
                </tr>
            `;
    });
}

function renderBookTable(books) {
  console.log(books);
  bookTableBody.innerHTML = '';

  books.forEach((book) => {
    //<tr> 엘리먼트를 생성하기
    const row = document.createElement('tr');

    //<tr>의 content을 동적으로 생성
    row.innerHTML = `
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.isbn}</td>
                    <td>${book.price}</td>
                    <td>${book.publishDate}</td>
                    <td>${book.detail ? book.detail.language : '-'}</td>
                    <td>${book.detail ? book.detail.pageCount : '-'}</td>
                    <td>${book.detail ? book.detail.publisher : '-'}</td>
                    <td>${book.detail ? book.detail.coverImageUrl : '-'}</td>
                    <td>${book.detail ? book.detail.edition : '-'}</td>
                    <td>${book.detail ? book.detail.description : '-'}</td>

                    <td>
                        <button class="edit-btn" onclick="editBook(${book.id})">수정</button>
                        <button class="delete-btn" onclick="deleteBook(${book.id})">삭제</button>
                    </td>
                `;
    //<tbody>의 아래에 <tr>을 추가시켜 준다.
    bookTableBody.appendChild(row);
  });
}

//Student 등록 함수
function createBook(bookData) {
  fetch(`${API_BASE_URL}/api/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookData), //Object => json
  })
    .then(async (response) => {
      if (!response.ok) {
        //응답 본문을 읽어서 에러 메시지 추출
        const errorData = await response.json();
        //status code와 message를 확인하기
        if (response.status === 409) {
          //중복 오류 처리
          throw new Error(errorData.message || '중복 되는 정보가 있습니다.');
        } else {
          //기타 오류 처리
          throw new Error(errorData.message || '도서 등록에 실패했습니다.');
        }
      }
      return response.json();
    })
    .then((result) => {
      showSuccess('도서가 성공적으로 등록되었습니다!');
      //studentForm.reset();
      resetForm();
      //목록 새로 고침
      loadBooks();
    })
    .catch((error) => {
      console.log('Error : ', error);
      showError(error.message);
    });
}

//학생 삭제 함수
function deleteBook(bookId) {
  if (!confirm(`ID = ${bookId} 인 도서를 정말로 삭제하시겠습니까?`)) {
    return;
  }

  fetch(`${API_BASE_URL}/api/books/${bookId}`, {
    method: 'DELETE',
  })
    .then(async (response) => {
      if (!response.ok) {
        //응답 본문을 읽어서 에러 메시지 추출
        const errorData = await response.json();
        //status code와 message를 확인하기
        if (response.status === 404) {
          //중복 오류 처리
          throw new Error(errorData.message || '존재하지 않는 도서입니다.');
        } else {
          //기타 오류 처리
          throw new Error(errorData.message || '도서 삭제에 실패했습니다.');
        }
      }
      showSuccess('도서가 성공적으로 삭제되었습니다!');
      //목록 새로 고침
      loadBooks();
    })
    .catch((error) => {
      console.log('Error : ', error);
      showError(error.message);
    });
}

//도서 수정전에 데이터 로드하는 함수
function editBook(bookId) {
  fetch(`${API_BASE_URL}/api/books/${bookId}`)
    .then(async (response) => {
      if (!response.ok) {
        //응답 본문을 읽어서 에러 메시지 추출
        const errorData = await response.json();
        //status code와 message를 확인하기
        if (response.status === 404) {
          //중복 오류 처리
          throw new Error(errorData.message || '존재하지 않는 도서입니다.');
        }
      }
      return response.json();
    })
    .then((book) => {
      //Form에 데이터 채우기
      bookForm.title.value = book.title;
      bookForm.author.value = book.author;
      bookForm.isbn.value = book.isbn;
      bookForm.price.value = book.price;
      bookForm.publishDate.value = book.publishDate;
      bookForm.language.value = book.detail.language;
      bookForm.pageCount.value = book.detail.pageCount;
      bookForm.publisher.value = book.detail.publisher;
      bookForm.coverImageUrl.value = book.detail.coverImageUrl;
      bookForm.edition.value = book.detail.edition;
      bookForm.description.value = book.detail.description;

      //수정 Mode 설정
      editingBookId = bookId;
      //버튼의 타이틀을 등록 => 수정으로 변경
      submitButton.textContent = '도서 수정';
      //취소 버튼을 활성화
      cancelButton.style.display = 'inline-block';
    })
    .catch((error) => {
      console.log('Error : ', error);
      showError(error.message);
    });
}
// 수정 모드에서 등록 모드로 초기화 하는 함수
function resetForm() {
  //form 초기화
  bookForm.reset();
  editingBookId = null;
  submitButton.textContent = '도서 등록';
  //취소버튼 사라짐
  cancelButton.style.display = 'none';
  clearMessages();
}

// 도서 수정 처리하는 함수
function updateBook(bookId, bookData) {
  fetch(`${API_BASE_URL}/api/books/${bookId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookData), //Object => json
  })
    .then(async (response) => {
      if (!response.ok) {
        //응답 본문을 읽어서 에러 메시지 추출
        const errorData = await response.json();
        //status code와 message를 확인하기
        if (response.status === 409) {
          //중복 오류 처리
          throw new Error(errorData.message || '중복 되는 정보가 있습니다.');
        } else {
          //기타 오류 처리
          throw new Error(errorData.message || '도서 수정에 실패했습니다.');
        }
      }
      return response.json();
    })
    .then((result) => {
      showSuccess('도서가 성공적으로 수정되었습니다!');
      //등록모드로 초기화
      resetForm();
      //목록 새로 고침
      loadBooks();
    })
    .catch((error) => {
      console.log('Error : ', error);
      showError(error.message);
    });
}

//성공 메시지 출력
function showSuccess(message) {
  formError.textContent = message;
  formError.style.display = 'block';
  formError.style.color = '#28a745';
}
//에러 메시지 출력
function showError(message) {
  formError.textContent = message;
  formError.style.display = 'block';
  formError.style.color = '#dc3545';
}
//메시지 초기화
function clearMessages() {
  formError.style.display = 'none';
}
