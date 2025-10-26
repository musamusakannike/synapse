import { Puff } from 'react-loader-spinner';

type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface LoaderProps {
  size?: LoaderSize;
  color?: string;
}

const sizeMap: Record<LoaderSize, string> = {
  xs: '16',
  sm: '20',
  md: '28',
  lg: '40',
  xl: '50',
};

const Loader = ({ size = 'md', color = "#155dfc" }: LoaderProps) => {
  const dimension = sizeMap[size];
  
  return (
    <Puff
      height={dimension}
      width={dimension}
      radius={1}
      color={color}
      ariaLabel="puff-loading"
      wrapperStyle={{}}
      wrapperClass=""
      visible={true}
    />
  );
};

export default Loader;