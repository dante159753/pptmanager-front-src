import MainContent from 'lib/app/main-content/main-content.vue';

// 初始化加载的模块
import Home from '../../home/home.vue';
import School from '../../backendmanage/school_manage.vue'
import Course from '../../backendmanage/course_manage.vue'
import Doc from '../../backendmanage/doc_manage.vue'
import Manager from '../../backendmanage/backend_manager.vue'

import SchoolManager from '../../backendmanage/schoolmanager_manage.vue'
import SchoolUser from '../../backendmanage/schooluser_manage.vue'

import DocView from '../../backendmanage/view_doc.vue'

// 异步加载的模块
var Notfound = function(resolve, reject) {
    require.ensure(['lib/app/notfound/notfound.vue'], function() {
        resolve(require('lib/app/notfound/notfound.vue'));
    });
};

var Account = function(resolve, reject) {
    require.ensure(['../../user/account.vue'], function() {
        resolve(require('../../user/account.vue'));
    });
};

import * as util from './util.js'

var routes = [{
    path: '/',
    component: MainContent,
    meta: {
        // 直接使用 name 作为菜单的名字, 如果有默认路由的时候会有警告
        // Named Route '首页' has a default child route.
        // When navigating to this named route (:to="{name: '首页'"),
        // the default child route will not be rendered.
        // Remove the name from this route and use the name of the default child route for named links instead.
        name: '首页'
    },
    children: [{
        path: '', // 默认路由
        component: Home
    }]
}];
if (util.check_logged()) {
    // backend manager
    var logtype = util.get_userinfo().logtype;
    if (logtype == 3) {
        routes = [{
            path: '/',
            component: MainContent,
            meta: {
                // 直接使用 name 作为菜单的名字, 如果有默认路由的时候会有警告
                // Named Route '首页' has a default child route.
                // When navigating to this named route (:to="{name: '首页'"),
                // the default child route will not be rendered.
                // Remove the name from this route and use the name of the default child route for named links instead.
                name: '首页'
            },
            children: [{
                path: '', // 默认路由
                component: Home
            }]
        }, {
            path: '/backend_manage',
            component: MainContent,
            meta: {
                name: '后台管理'
            },
            children: [{
                path: '', // 默认路径
                redirect: 'school',
                meta: {
                    hidden: true // 隐藏的路由不会在路由菜单中显示出来
                }
            }, {
                path: 'school',
                component: School,
                meta: {
                    name: '学校管理'
                }
            }, {
                path: 'course',
                component: Course,
                meta: {
                    name: '课程管理'
                }
            }, {
                path: 'doc',
                component: Doc,
                meta: {
                    name: '文档管理'
                }
            }, {
                path: 'manager',
                component: Manager,
                meta: {
                    name: '后台管理员管理'
                }
            }, {
                path: 'school_manager',
                component: SchoolManager,
                meta: {
                    name: '学校管理员管理'
                }
            }]
        }, {
            path: '/school_manage',
            component: MainContent,
            meta: {
                name: '学校管理'
            },
            children: [{
                path: '', // 默认路径
                redirect: 'school_user',
                meta: {
                    hidden: true // 隐藏的路由不会在路由菜单中显示出来
                }
            }, {
                path: 'school_user',
                component: SchoolUser,
                meta: {
                    name: '学校用户管理'
                }
            }]
        }, {
            path: '/user',
            component: MainContent,
            meta: {
                name: '用户'
            },
            children: [{
                path: '',
                redirect: 'account',
                meta: {
                    hidden: true
                }
            }, {
                path: 'doc_view',
                component: DocView,
                meta: {
                    name: '查看文档'
                }
            }, {
                path: 'account',
                component: Account,
                meta: {
                    name: '用户信息'
                }
            }]
        }];

        // 在最后添加处理 404 路由
        routes.push({
            path: '*', // 匹配未找到路由的情况, 类似 404 页面
            component: Notfound,
            meta: {
                hidden: true
            }
        });

    } else if (logtype == 2) {
        // school manager
        routes = [{
            path: '/',
            component: MainContent,
            meta: {
                // 直接使用 name 作为菜单的名字, 如果有默认路由的时候会有警告
                // Named Route '首页' has a default child route.
                // When navigating to this named route (:to="{name: '首页'"),
                // the default child route will not be rendered.
                // Remove the name from this route and use the name of the default child route for named links instead.
                name: '首页'
            },
            children: [{
                path: '', // 默认路由
                component: Home
            }]
        }, {
            path: '/school_manage',
            component: MainContent,
            meta: {
                name: '学校管理'
            },
            children: [{
                path: '', // 默认路径
                redirect: 'school_user',
                meta: {
                    hidden: true // 隐藏的路由不会在路由菜单中显示出来
                }
            }, {
                path: 'school_user',
                component: SchoolUser,
                meta: {
                    name: '学校用户管理'
                }
            }]
        }, {
            path: '/user',
            component: MainContent,
            meta: {
                name: '用户'
            },
            children: [{
                path: '',
                redirect: 'account',
                meta: {
                    hidden: true
                }
            }, {
                path: 'doc_view',
                component: DocView,
                meta: {
                    name: '查看文档'
                }
            }, {
                path: 'account',
                component: Account,
                meta: {
                    name: '用户信息'
                }
            }]
        }];

        // 在最后添加处理 404 路由
        routes.push({
            path: '*', // 匹配未找到路由的情况, 类似 404 页面
            component: Notfound,
            meta: {
                hidden: true
            }
        });
    } else {
        // school user
        routes = [{
            path: '/',
            component: MainContent,
            meta: {
                // 直接使用 name 作为菜单的名字, 如果有默认路由的时候会有警告
                // Named Route '首页' has a default child route.
                // When navigating to this named route (:to="{name: '首页'"),
                // the default child route will not be rendered.
                // Remove the name from this route and use the name of the default child route for named links instead.
                name: '首页'
            },
            children: [{
                path: '', // 默认路由
                component: Home
            }]
        }, {
            path: '/user',
            component: MainContent,
            meta: {
                name: '用户'
            },
            children: [{
                path: '',
                redirect: 'account',
                meta: {
                    hidden: true
                }
            }, {
                path: 'doc_view',
                component: DocView,
                meta: {
                    name: '查看文档'
                }
            }, {
                path: 'account',
                component: Account,
                meta: {
                    name: '用户信息'
                }
            }]
        }];

        // 在最后添加处理 404 路由
        routes.push({
            path: '*', // 匹配未找到路由的情况, 类似 404 页面
            component: Notfound,
            meta: {
                hidden: true
            }
        });
    }
}


export default routes;
