import React, { useState, useEffect, useRef, useCallback } from "react";
import { getMockData } from "../datas/MockData";

interface MockData {
  productId: string;
  productName: string;
  price: number;
  boughtDate: string;
}

const InfiniteScroll: React.FC = () => {
  const [data, setData] = useState<MockData[]>([]);
  const pageRef = useRef<number>(1); // 페이지 추적을 위한 useRef
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const loadMoreData = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const { datas, isEnd } = await getMockData(pageRef.current);
    // setData((prevData) => [...prevData, ...datas]);

    setData((prevData) => {
      const newData = [...prevData, ...datas];
      const newTotalPrice = newData.reduce((sum, item) => sum + item.price, 0);
      setTotalPrice(newTotalPrice);

      return newData;
    });

    if (isEnd) {
      setHasMore(false);
    } else {
      pageRef.current += 1;
    }

    setLoading(false);
  }, [loading, hasMore]);

  useEffect(() => {
    loadMoreData();
  }, [loadMoreData]);

  // Intersection Observer를 사용하여 마지막 요소 감지
  useEffect(() => {
    if (loading || !hasMore) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMoreData();
      }
    });

    if (lastElementRef.current) {
      observer.current.observe(lastElementRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [loading, hasMore]);

  return (
    <div>
      <h1>무한 스크롤 예제</h1>
      <ul>
        {data.map((item, index) => (
          <li key={item.productId}>
            {item.productName} - ${item.price} (구매일:{" "}
            {new Date(item.boughtDate).toLocaleDateString()})
          </li>
        ))}
      </ul>
      <div
        ref={lastElementRef}
        style={{ height: "20px", backgroundColor: "transparent" }}
      />
      {loading && <p>로딩 중...</p>}
      {!hasMore && <p>더 이상 불러올 데이터가 없습니다.</p>}{" "}
      <div>
        <h2>현재까지 불러온 상품의 총합: ${totalPrice}</h2>
      </div>
    </div>
  );
};

export default InfiniteScroll;
