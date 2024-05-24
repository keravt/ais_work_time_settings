import axios from "axios";
import { Action } from "src/enums/action.enum";
import { Message } from "src/helpers/message";
import { TokenStore } from "src/helpers/token.store";
import { RESOURCES } from "src/resources";
import { HttpException, HttpStatus } from "@nestjs/common"





export function AuthDecorator(){

    return function(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>){
        const method = descriptor.value;// Получаем функцию метода, на который навешен декоратор
        descriptor.value = async function(...args) { // Переназначаем метод, который будет вызываться
            const tokenStore: TokenStore = new TokenStore() // Создаем экземпляр синглтона хранилища токена
            let token = tokenStore.getToken() // забираем из хранилища токен
            let getFuncFlag = false // Является ли декорируемый метод ХТТП методом гет
            let resource_meta = propertyName.split('_') // Разделяем имя декорируемого метода, чтобы найти имя HTTP метода и имя ресурса
            let resource = RESOURCES.find(element => element.name === resource_meta[1]) // находим требуемый ресурс по имени декорируемого метода
            let permissions = await axios.post(`${process.env.AUTH_SERVICE_URL}/api/auth/bt_permissions`, {data: `${resource.uid},${args[0].sub}`}, {headers: {Authorization: `Bearer ${token}`}}) // забираем разрешения для данного пользователя и ресурса у сервиса авторизации
            // console.log(args)
            // console.log('qwdqw',permissions)
            if (permissions.data.length === 0){ // если нет никаких разрешений
                throw new HttpException('Нет доступа на чтение', HttpStatus.FORBIDDEN); 
            }
            else{
                args[0]['permissions'] = JSON.stringify(permissions.data) // устанавливаем в объект User, который приходит с кейклока свойство permissions и закидываем туда все разрешения
                for (let ruleIndex = 0; ruleIndex < permissions.data.length; ruleIndex++){ // обход всех прравил
                    for (let permIndex = 0; permIndex < permissions.data[ruleIndex].length; permIndex++){ // в каждом правиле смотрим разрешения
                        if (permissions.data[ruleIndex][permIndex].action.toLowerCase() === Action.post){ // если действие = Запись, то пользователь имеет все разрешения
                            const result = method.apply(this, args); // вызываем декорируемую функцию с переданными параметрами со свойством permissions
                            return result; // возвращаем результат декорируемой функции
                        }
                        
                        if ((permissions.data[ruleIndex][permIndex].action.toLowerCase() === Action.get) && (!getFuncFlag)){ // Если находим в разрешениях разрешение на чтение
                            getFuncFlag = true
                            if ((getFuncFlag) && (resource_meta[0] === 'get')){ // Если есть разрешение на чтение и функция обрабатывает HTTP метод GET
                                const result = method.apply(this, args); // вызываем ф-ю
                                return result; // возвр-ем рез-тат
                            }
                        }
                    }
                }
                if ((getFuncFlag) && (resource_meta[0] === 'post' || 'create' || 'update' || 'delete' || 'remove' || 'edit')){ // если есть разрешение на GET но обрабатываем POST
                    throw new HttpException('Нет доступа на чтение', HttpStatus.FORBIDDEN);
                }

            }

        };
        
    }
}