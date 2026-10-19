import React from 'react';
import { Spin, Flex } from 'antd';

const LoadingSpinner = ({ tip = 'Đang tải dữ liệu...' }) => {
  return (
    <Flex justify="center" align="center" style={{ minHeight: 200, width: '100%' }}>
      <Spin size="large" tip={tip} />
    </Flex>
  );
};

export default LoadingSpinner;
