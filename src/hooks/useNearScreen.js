import { useEffect,useState,useRef } from "react"

export default function useNearScreen({distance= '100px'} = {}){
    const [isNearScreen,setShow] = useState(false)// cuando cambia su valor, vuelve a renderizar el componente
    const fromRef = useRef() // permite guardar valores que se mantienen entre rerendizados

    useEffect(function(){
        let observer
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
        observer = new IntersectionObserver(onChange, {
            rootMargin: distance
        })

        //empezamos a observar
        // para acceder al valor de la referencia se ocupa .current
        observer.observe(fromRef.current) // recibe el elemento a observar
        
        // cuando el componente se deje de utilizar limpie el evento
        return () => observer.disconnect()
    })
    return {isNearScreen,fromRef}
}