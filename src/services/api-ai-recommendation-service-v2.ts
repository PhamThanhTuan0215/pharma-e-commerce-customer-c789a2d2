import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_URL_API_AI_RECOMMENDATION_SERVICE || 'http://localhost:8088',
  headers: {
    "Content-Type": "application/json",
  }
});

// Hàm gọi API "nháp" và "chính thức"
export async function callWithPrewarm(endpoint: string, payload: any) {
  const source = axios.CancelToken.source();

  // Gửi request nháp
  api.post(endpoint, payload, { cancelToken: source.token }).catch((err) => {
    if (axios.isCancel(err)) {
      console.log('🛑 Request nháp đã bị hủy');
    }
  });

  // Chờ 1 giây rồi hủy request nháp
  await new Promise(resolve => setTimeout(resolve, 1000));
  source.cancel();

  // Gửi request thật
  try {
    const response = await api.post(endpoint, payload);
    return response;
  } catch (err) {
    console.error('❌ Request thật bị lỗi:', err);
    throw err;
  }
}
