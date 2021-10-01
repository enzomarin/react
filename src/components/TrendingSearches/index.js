import React, {Suspense} from 'react'
import useNearScreen from '../../hooks/useNearScreen'

// importar el componente TrendingSearches solo cuando lo necesite
const TrendingSearches = React.lazy(
    () => import('./TrendingSearches')
)

export default function LazyTrending(){
   
    const {isNearScreen,fromRef} = useNearScreen({distance: '200px'})


    return <div ref = {fromRef}>
        <Suspense fallback={'aui va un spinner'}> 
            {isNearScreen ? <TrendingSearches /> : null}
        </Suspense>
    </div>
}