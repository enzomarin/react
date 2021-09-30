import React, { useEffect, useState, useRef } from 'react'
import getTrendingTerms from '../../services/getTrendingTermsServices'
import Category from '../Category'

function TrendingSearches (){
    const [trends, setTrends] = useState([])
    


    useEffect(function() {

        getTrendingTerms().then(setTrends)
    }, [])
    
    return <Category name= 'Tendencias' options = {trends}/>
}
function useNearScreen({elementRef}){
    const [show,setShow] = useState(false)// cuando cambia su valor, vuelve a renderizar el componente

    useEffect(function(){
        // Funcion a ejecutar cuando haya cambios en la interseccion
        const onChange = (entries, observer) =>{
            //Recuperamos el elemento
            const el = entries[0]
            // si el elemento es intersectado
            if (el.isIntersecting){
                setShow(true)
                // desconectamos, de manera que no siga observando
                observer.disconnect()
            }
        }

        // recibe 2 parametro   s, el callback a ejecutar, y un objeto de opciones
        const observer = new IntersectionObserver(onChange, {
            rootMargin:'100px'
        })

        //empezamos a observar
        // para acceder al valor de la referencia se ocupa .current
        observer.observe(elementRef.current) // recibe el elemento a observar
        
        // cuando el componente se deje de utilizar limpie el evento
        return () => observer.disconnect()
    })
}
export default function LazyTrending(){
   
    const elementRef = useRef() // permite guardar valores que se mantienen entre rerendizados
    


    return <div ref = {elementRef}>
        
        {show ? <TrendingSearches /> : null}
    </div>
}