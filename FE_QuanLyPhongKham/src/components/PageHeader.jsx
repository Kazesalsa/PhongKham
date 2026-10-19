import React from 'react';
import { Flex, Typography } from 'antd';

const { Title, Text } = Typography;

const PageHeader = ({ title, subtitle, extra }) => {
  return (
    <Flex justify="space-between" align="center" style={{ marginBottom: 20 }}>
      <div>
        <Title level={4} style={{ margin: 0, fontWeight: 600, color: '#0f172a' }}>
          {title}
        </Title>
        {subtitle && (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {subtitle}
          </Text>
        )}
      </div>
      {extra && <Flex gap="small">{extra}</Flex>}
    </Flex>
  );
};

export default PageHeader;
