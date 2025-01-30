import { Button } from '@/components/ui/button'
import "@/ui/styles/App.css"
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="h-screen w-screen flex justify-center items-center"> {/* Flexbox to center */}
    <div className="flex flex-col items-center gap-4 p-8 rounded-lg shadow-md">
    <Link to="/calibrate">
        <Button className='w-36 text-wrap'>Calibrate Camera</Button>
        </Link>
        <Link to="/new-item">
          <Button className='w-36 text-wrap'>New Item</Button>
        </Link>
        <Link to="/test-item">
          <Button className='w-36 text-wrap'>Test Item</Button>
        </Link>
      </div>
    </div>
  );
}

export default Home;