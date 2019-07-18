/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
import uuid from 'uuid';

import { getPackSize,
         LAMBDA_LIMITED_SIZE } from '../utility/Util.js'

const leancloud = "https://leancloud.cn"
const server = "PLACEHOLDER_FOR_GITHUB"
const ec2 = "PLACEHOLDER_FOR_GITHUB"
export async function RequestSMSCode(CountryCode,mobilePhoneNumber){
    mobilePhoneNumber = "+" + CountryCode + mobilePhoneNumber    
    var response = await fetch(leancloud + "/1.1/requestSmsCode",{
        method:"POST",
        headers:{'X-LC-Id':"PLACEHOLDER_FOR_GITHUB",
                 'X-LC-Key':"PLACEHOLDER_FOR_GITHUB",
                'Content-type':'application/json'
                },
        body:JSON.stringify({
            mobilePhoneNumber:mobilePhoneNumber,
            ttl:10,
            name:"MASKOFF",
            op:"手机号码验证"
            })
        });
    return response    
}

export async function checkGFW(){
    //sets global.GFW
    //check if user is in GFW
    //make call twice to make sure
    try{
        const response = await fetch("https://www.google.com/",{
            method:"GET",
            headers:{'Accept':'application/json',
                    'Content-type':'application/json',
                    }
            });
        status = response.status
        
        if(status == 200){
            global.GFW=false
            return
        }else{
            status = await fetch("https://www.google.com/",{
                method:"GET",
                headers:{'Accept':'application/json',
                        'Content-type':'application/json',
                        }
                }).status;
            if(status == 200){
                global.GFW=false
            }else{
                global.GFW=true
            }
        }
    }catch(error){
        global.GFW=true
        return
    }
}

// 模板

// response = await Relogin({coordinate:cur_coor})
//     if(response == false){
//       //说明前面出现了error, 需要重连
//       setTimeout(()=>this.setState({show:true,type:"No_Internet",message:'',title:''}),100)
//     }else if(response.ok){
//       json = await response.json()  
//     }else if(response.status == 401){
//       navigation.navigate("Login")
//     }else{
//       //如果response不ok, 让用户重连试试
//       setTimeout(()=>this.setState({show:true,type:"Bad_Response",message:'',title:''}),100)
//       return
//     }

export async function Relogin(cur_coor){
    try{
        var response = await fetch(server + "/users/read_access",{
            method:"POST",
            headers:{'Content-type':'application/json',
                     'access-token':global.access_token
                    },
            body:JSON.stringify(cur_coor)
            });
    }catch(err){
        return false
    }
    return response
}

export async function Register(user_info){
    try{
        var response = await fetch(server + "/users",{
            method:"POST",
            headers:{'Content-type':'application/json',
                     'access-token':global.access_token
                    },
            body:JSON.stringify(user_info)
            });
    }catch(err){
        return false
    }   

    return response
}

export async function CheckWriteAccess(){
    var response = await fetch(server+"/users/write_access",{
        method:"GET",
        headers:{'Accept':'application/json',
                'Content-type':'application/json',
                'access-token':global.access_token
                }
        });
    return response
}

export async function UpgradeToWriteAccess(CountryCode,mobilePhoneNumber,vcode){
    mobilePhoneNumber = "+" + CountryCode + mobilePhoneNumber
    var response = await fetch(server + "/users/write_access",{
        method:"POST",
        headers:{'Content-type':'application/json',
                 'access-token':global.access_token
                },
        body:JSON.stringify({
            phone_number:mobilePhoneNumber,
            vcode:vcode
            })
        });
    return response
}

export async function SearchMaskers(keyword){
    var affix = "/maskers/search"
    try{
        var response = await fetch(server+affix,{
            method:"POST",
            headers:{'Accept':'application/json',
                    'Content-type':'application/json',
                    'access-token':global.access_token
                    },
            body:JSON.stringify(keyword)
            });
    }catch(err){
        return false
    }
    return response
}

export async function SearchRoasts(keyword){
    var affix = "/roasts/search"
    try{
        var response = await fetch(server+affix,{
            method:"POST",
            headers:{'Accept':'application/json',
                    'Content-type':'application/json',
                    'access-token':global.access_token
                    },
            body:JSON.stringify(keyword)
            });
    }catch(err){
        return false
    }
    return response
}



//master function 
export const futch_lambda = (url, opts={}, onProgress) => {
    return new Promise( (res, rej)=>{
        var xhr = new XMLHttpRequest();
        xhr.open(opts.method || 'get', server+url);
        xhr.setRequestHeader("access_token",global.access_token)
        xhr.setRequestHeader("Content-Type","multipart/form-data")
        for (var k in opts.headers||{})
            xhr.setRequestHeader(k, opts.headers[k]);
        xhr.onload = e => res(e.target);
        xhr.onerror = rej;
        if (xhr.upload && onProgress)
            xhr.upload.onprogress = onProgress; // event.loaded / event.total * 100 ; //event.lengthComputable
        xhr.send(opts.body);
        xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
          }
        };
    });
}

export const futch_ec2 = (url, opts={}, onProgress) => {
    return new Promise( (res, rej)=>{
        var xhr = new XMLHttpRequest();
        xhr.open(opts.method || 'get', ec2+url);
        xhr.setRequestHeader("access_token",global.access_token)
        xhr.setRequestHeader("Content-Type","multipart/form-data")
        for (var k in opts.headers||{})
            xhr.setRequestHeader(k, opts.headers[k]);
        xhr.onload = e => res(e.target);
        xhr.onerror = rej;
        if (xhr.upload && onProgress)
            xhr.upload.onprogress = onProgress; // event.loaded / event.total * 100 ; //event.lengthComputable
        xhr.send(opts.body);
        xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
          }
        };
    });
}

export function signatureFactory(client_id){
    client_id = 'Jerry'
    return fetch(server+'/chat/login_sign/'+client_id, {
        method:"GET",
        headers:{'Accept':'application/json',
                'Content-type':'application/json',
                'access-token':global.access_token
                }
    }).then(response  => response.json())
}



export async function changeThumbnail(new_thumbnail){
    result = await getPackSize(new_thumbnail,"changeThumbnail")
    if (result == false){
        return "getPackSize_error"
    }
    //console.log(result)
    
    if(result < LAMBDA_LIMITED_SIZE){
        send_server = server
    }else{
        send_server = ec2
    }
    

    data = new FormData()
    data.append("0",{uri:new_thumbnail,type:"image/jpeg",name:uuid.v4()})
    pack = {"filename":new_thumbnail}
    data.append('pack',JSON.stringify(pack))
    try{
        var response = await fetch(send_server + "/users/thumbnail",{
            method:"POST",
            headers:{'Content-type':'multipart/form-data',
                     'access-token':global.access_token
                    },
            body:data
            });
    }catch(err){
        return false
    }
    return response
}


// 模板

// response = await getArticleByAid(aid)
//     if(response == false){
//       //说明前面出现了error, 需要重连
//       setTimeout(()=>this.setState({show:true,type:"No_Internet",message:'',title:''}),100)
//     }else if(response.ok){
//       json = await response.json()  
//     }else if(response.status == 401){
//       navigation.navigate("Login")
//     }else{
//       //如果response不ok, 让用户重连试试
//       setTimeout(()=>this.setState({show:true,type:"Bad_Response",message:'',title:''}),100)
//       return
//     }
export async function getArticleByAid(aid){
    try{
        var response = await fetch(server + "/articles/" + aid,{
            method:"GET",
            headers:{
                     'Content-type':'application/json',
                     'access-token':global.access_token
                    }
            });
    }catch(err){
        return false
    }
    return response
}

export async function getComments(url){
    try{
        var response = await fetch(url,{
            method:"GET",
            headers:{'Content-type':'application/json',
                     'access-token':global.access_token
                    }
            });
    }catch(err){
        return false
    }
    return response
}

export async function deleteArticle(aid){
    try{
        var response = await fetch(server + "/articles",{
            method:"DELETE",
            headers:{
                'Content-type':'application/json',
                'access-token':global.access_token
                    },
            body:JSON.stringify({"aid":aid})
            });
    }catch(err){
        return false
    }
    return response
}

export async function deleteRoast(rid){
    try{
        var response = await fetch(server + "/articles",{
            method:"DELETE",
            headers:{
                'Content-type':'application/json',
                'access-token':global.access_token
                    },
            body:JSON.stringify({"rid":rid})
            });
    }catch(err){
        return false
    }
    return response
}

export async function getMaskerByMid(mid){
    try{
        var response = await fetch(server + "/maskers/" + mid,{
            method:"GET",
            headers:{
                     'Content-type':'application/json',
                     'access-token':global.access_token
                    }
            });
    }catch(err){
        return false
    }
    return response
}

export async function Like(object_type,object_id){
    try{
        var response = await fetch(server + "/likes",{
            method:"POST",
            headers:{
                     'Content-type':'application/json',
                     'access-token':global.access_token
                    },
            body:JSON.stringify({
                db_type:object_type,
                db_id:object_id,
                operation:"like"
            })
            });
    }catch(err){
        return false
    }
    return response
}


export async function Dislike(object_type,object_id){
    try{
        var response = await fetch(server + "/likes",{
            method:"POST",
            headers:{
                     'Content-type':'application/json',
                     'access-token':global.access_token
                    },
            body:JSON.stringify({
                db_type:object_type,
                db_id:object_id,
                operation:"dislike"
            })
            });
        
    }catch(err){
        return false
    }
    return response
}

export async function selfPosts(){
    try{
        var response = await fetch(server + "/users/info/articles_roasts",{
            method:"GET",
            headers:{
                     'Content-type':'application/json',
                     'access-token':global.access_token
                    }
            });
        
    }catch(err){
        return false
    }
    return response
}


export async function chatImageMax2048(image){
    
    result = await getPackSize(image,"chatImageMax2048")
    if (result == false){
        return "getPackSize_error"
    }

    if(result < LAMBDA_LIMITED_SIZE){
        send_server = server
    }else{
        send_server = ec2
    }

    data = new FormData()
    data.append("file",{uri:image,type:"image/jpeg",name:image})
    data.append('filename',image)
    
    try{
        var response = await fetch(send_server + "/upload",{
            method:"POST",
            headers:{'Content-type':'multipart/form-data',
                     'access-token':global.access_token
                    },
            body:data
            });
    }catch(err){

        return false
    }
    return response
}

export async function sendComment(original_comment,body,db_type){
    result = await getPackSize(body,"sendComment")
    if (result == false){
        return "getPackSize_error"
    }

    if(result < LAMBDA_LIMITED_SIZE){
        send_server = server
    }else{
        send_server = ec2
    }

    try{
        var response = await fetch(send_server+"/"+"comments",{
            method:"POST",
            headers:{'Accept':'application/json',
                    'Content-type':'application/json',
                    'access-token':global.access_token
                    },
            body:JSON.stringify({
                'db_id':original_comment.db_id,
                'db_type':db_type,
                'content':body,
                'reply_id':original_comment.reply_id,
                'parent_id':original_comment.parent_id
                })
        });
    }catch(err){

        return false
    }
    return response
}

export async function getUserCount(){
    try{
        var response = await fetch(server + "/users/info/count",{
            method:"GET",
            headers:{
                     'Content-type':'application/json',
                     'access-token':global.access_token
                    }
            });
    }catch(err){
        return false
    }
    return response
}

export async function getRoastsAround(info){
    try{
        var response = await fetch(server + "/roasts/search/coor",{
            method:"POST",
            headers:{'Content-type':'application/json',
                     'access-token':global.access_token
                    },
            body:JSON.stringify(info)
            });
    }catch(err){
        return false
    }
    return response
}

export async function getArticlesAround(info){
    try{
        var response = await fetch(server + "/articles/search/coor",{
            method:"POST",
            headers:{'Content-type':'application/json',
                     'access-token':global.access_token
                    },
            body:JSON.stringify(info)
            });
    }catch(err){
        return false
    }
    return response
}

export async function submitVote(checkedOptions,db_id,db_type,vote_id){
    info = {
        checkedOptions:checkedOptions,
        db_id:db_id,
        db_type:db_type,
        vote_id:vote_id
    }
    try{
        var response = await fetch(server + "/votes",{
            method:"POST",
            headers:{'Content-type':'application/json',
                     'access-token':global.access_token
                    },
            body:JSON.stringify(info)
            });
    }catch(err){
        return false
    }
    return response

}
export async function Follow(db_type,db_id){
    try{
        var response = await fetch(server + "/likes",{
            method:"POST",
            headers:{
                     'Content-type':'application/json',
                     'access-token':global.access_token
                    },
            body:JSON.stringify({
                db_type:db_type,
                db_id:db_id,
                operation:"follow"
            })
            });
    }catch(err){
        return false
    }
    return response
}


export async function Unfollow(db_type,db_id){
    try{
        var response = await fetch(server + "/likes",{
            method:"POST",
            headers:{
                     'Content-type':'application/json',
                     'access-token':global.access_token
                    },
            body:JSON.stringify({
                db_type:db_type,
                db_id:db_id,
                operation:"unfollow"
            })
            });
        
    }catch(err){
        return false
    }
    return response
}