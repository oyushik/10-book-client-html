const API_BASE_URL = 'http://localhost:8080';

//DOM element 가져오기
const bookForm = document.getElementById('bookForm');
const bookTableBody = document.querySelector('tbody');

// Form Load Event 처리
document.addEventListener('DOMContentLoaded', () => {
  loadBooks();
});

// Form Submit Event 처리
document.addEventListener('submit', function (event) {
  event.preventDefault(); // 기본 동작 방지
  console.log('Form 제출 되었음......');

  // FormData 객체 생성
  const bookFormData = new FormData(bookForm);
  bookFormData.forEach((value, key) => {
    console.log(key + ': ' + value);
  });

  // 사용자 정의 book 객체 생성 (공백 제거)
  const bookData = {
    title: bookFormData.get('title').trim(),
    author: bookFormData.get('author').trim(),
    isbn: bookFormData.get('isbn').trim(),
    price: bookFormData.get('price').trim(),
    publishDate: bookFormData.get('publishDate').trim(),
  };

  //유효성 체크하기
  if (!validateBook(bookData)) {
    //검증체크 실패하면 리턴하기
    return;
  }
  //유효한 데이터 출력하기
  console.log(bookData);
});

//데이터 유효성을 체크하는 함수
function validateBook(book) {
  // 필수 필드 검사
  if (!book.title) {
    alert('제목을 입력해주세요.');
    return false;
  }

  if (!book.author) {
    alert('저자를 입력해주세요.');
    return false;
  }

  if (!book.isbn) {
    alert('ISBN을 입력해주세요.');
    return false;
  }

  if (!book.price) {
    alert('가격을 입력해주세요.');
    return false;
  }

  if (!book.publishDate) {
    alert('출판일을 입력해주세요.');
    return false;
  }

  // // ISBN 형식 검사 (예: 978-3-16-148410-0)
  // const isbnPattern = /^(978|979)-\d{1,5}-\d{1,7}-\d{1,7}-\d{1}$/;
  // if (!isbnPattern.test(book.isbn)) {
  //   alert('올바른 ISBN 형식이 아닙니다.');
  //   return false;
  // }

  // 가격 형식 검사 (숫자만 허용)
  const pricePattern = /^\d+$/;
  if (!pricePattern.test(book.price)) {
    alert('가격은 숫자만 입력 가능합니다.');
    return false;
  }

  // 출판일 형식 검사 (YYYY-MM-DD)
  const publishDatePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!publishDatePattern.test(book.publishDate)) {
    alert('올바른 출판일 형식이 아닙니다. (YYYY-MM-DD)');
    return false;
  }

  // 출판일 유효성 검사
  const publishDate = new Date(book.publishDate);
  if (isNaN(publishDate.getTime())) {
    alert('올바른 출판일을 입력해주세요.');
    return false;
  }

  // 출판일이 미래인 경우
  const today = new Date();
  if (publishDate > today) {
    alert('출판일은 오늘 이전이어야 합니다.');
    return false;
  }

  // 가격이 0보다 큰지 검사
  const price = parseFloat(book.price);
  if (price <= 0) {
    alert('가격은 0보다 커야 합니다.');
    return false;
  }

  return true;
} //validateBook

// 도서 목록 로드
function loadBooks() {
  console.log('도서 목록 로드 중......');
}
