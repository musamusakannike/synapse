import { Puff } from 'react-loader-spinner';

type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface LoaderProps {
  size?: LoaderSize;
}

const sizeMap: Record<LoaderSize, string> = {
  xs: '16',
  sm: '20',
  md: '28',
  lg: '40',
  xl: '50',
};

const Loader = ({ size = 'md' }: LoaderProps) => {
  const dimension = sizeMap[size];
  
  return (
    <Puff
      height={dimension}
      width={dimension}
      radius={1}
      color="#155dfc"
      ariaLabel="puff-loading"
      wrapperStyle={{}}
      wrapperClass=""
      visible={true}
    />
  );
};

export default Loader;