import { Button } from '@/components/ui/button'
import "@/ui/styles/App.css"
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className='h-full w-full'>
      <div className='flex flex-col w-48 gap-4'>
        <Link to="/calibrate">
          <Button>Calibrate Camera</Button>
        </Link>
        <Link to="/new-item">
          <Button>New Item</Button>
        </Link>
        <Link to="/test-item">
          <Button>Test Item</Button>
        </Link>
      </div>
    </div>
  )
}

export default Home