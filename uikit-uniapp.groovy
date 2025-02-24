pipeline {
    agent { label "builder240" }

    environment {
        FEISHU_WEBHOOK = "https://open.feishu.cn/open-apis/bot/v2/hook/6f18baa4-edf6-4898-aec4-9765cbbfd7c6" // 飞书Webhook地址
        REMOTE_GIT = "git@git.e.coding.zego.cloud:dev/solution_os/zego_uikit_uniapp_native.git"
        APPLE_MOBILEPROVISION_PATH = "C:\\Users\\Administrator\\profile\\uikitcall20250612.mobileprovision"
        APPLE_PIE_PATH = "C:\\Users\\Administrator\\profile\\20250612.p12"
        HBUILDERX_CLI = "D:\\HBuilderX\\cli.exe"
    }

    stages {
        stage('环境检测') {
            steps {
                script {
                    echo "注: 禁止使用npm upgrade, nvm update等升级相关语句，若环境问题请找管理员协助处理，切勿自行更新！"
                    sh "nvm list"
                    sh "nvm use 20.18.0"
                    sh "node -v"
                    sh "npm i pnpm -g"
                    sh "pnpm -v"

                    echo "cli 前置准备"
                    // bat "$HBUILDERX_CLI app quit"
                    bat "$HBUILDERX_CLI open"
                    bat "$HBUILDERX_CLI ver"
                    bat "$HBUILDERX_CLI user logout"
                    // bat "$HBUILDERX_CLI user login --username \"username\" --password \"password\""
                    bat "$HBUILDERX_CLI user info"
                }
            }
        }

        stage('拉取代码') {
            steps {
                script {
                    echo "WORKSPACE: ${env.WORKSPACE}"
                    echo "开始拉取代码"

                    git credentialsId: 'zegobuilder', url: "${env.REMOTE_GIT}"
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: "${env.Branch}"]],
                        extensions: [],
                        userRemoteConfigs: [[credentialsId: 'zegobuilder', url: "${env.REMOTE_GIT}"]]
                    ])
                    sh "git reset HEAD --hard"
                    sh "git clean -fd"
                    bat "dir"
                    echo "拉取代码完成！"
                }
            }
        }

        stage('SDK构建') {
            steps {
              script {
                  sh "node -v"
                  sh "pnpm install"
                  script {
                    wrap([$class: 'BuildUser']) {
                        BUILD_USER = "${BUILD_USER}"
                    }
                    echo "BUILD_USER: ${BUILD_USER}"
                    pkg = readJSON file: "${env.WORKSPACE}./package.json"
                    BUILD_VERSION = "${pkg.version}"
                    echo "BUILD_VERSION: ${BUILD_VERSION}"
                  }
                  sh "pnpm build:all"
                  echo "SDK构建完成"

                  echo "打开项目"
                  bat "$HBUILDERX_CLI project list"
                  bat "$HBUILDERX_CLI project open --path ${env.WORKSPACE}"

                  echo "云打包"
                  packResult=bat "$HBUILDERX_CLI pack --config ${env.WORKSPACE}\\pack.json"

                  echo "对云打包的结果进行解析，拿到文件地址"
                  echo "$packResult"
                  bat "dir ${env.WORKSPACE}\\unpackage\\release\\ipa"
                  bat "dir ${env.WORKSPACE}\\unpackage\\release\\apk"

                  echo "cli 后置处理"
                  bat "$HBUILDERX_CLI user logout"
                  bat "$HBUILDERX_CLI app quit"
              }
            }
        }

        stage('构建通知') {
            steps {
                script {
                    // if (env.SEND_NOTICE == "true") {
                    //     FeiShu()
                    //     echo "构建通知完成！"
                    // } else {
                        echo "跳过构建通知"
                    // }
                }
            }
        }
    }
}

def FeiShu() {
  sh "npx cross-env WEBHOOK='${FEISHU_WEBHOOK}' SHOW_NAME='${SHOW_NAME}' BUILD_ENV='${BUILD_ENV}' BUILD_USER='${BUILD_USER}' BUILD_VERSION='${BUILD_VERSION}' BUILD_RESULT='${currentBuild.currentResult}' BUILD_START_TIME='${formatTimestamp(currentBuild.startTimeInMillis)}' BUILD_DURATION='${formatDuration(currentBuild.duration)}' GIT_COMMIT_MSG='${GIT_COMMIT_MSG}' JOB_URL='${JOB_URL}' ARTIFACT_URL='${ARTIFACT_URL}' VERSION_RECORD_URL='${VERSION_RECORD_URL}' node ./scripts/inform.mjs"
}

// def FeiShu(webhook) {
//   sh """
//   curl --location --request POST ${webhook} \
//     --header 'Content-Type: application/json' \
//     --data '{
//       "msg_type": "interactive",
//       "card": {
//         "config": {
//           "wide_screen_mode": true,
//           "enable_forward": true
//         },
//         "elements": [
//           {
//             "tag": "div",
//             "text": {
//               "content": "**项目名称：** ${SHOW_NAME} \\n**构建环境：** ${BUILD_ENV} \\n**构建人员：** ${BUILD_USER} \\n**构建版本：** ${BUILD_VERSION} \\n**构建结果：** ${currentBuild.currentResult} \\n**构建时间：** ${formatTimestamp(currentBuild.startTimeInMillis)} \\n**构建耗时：** ${formatDuration(currentBuild.duration)} \\n**更新内容：** ${GIT_COMMIT_MSG} \\n**消息通知：** <at id=all></at> \\n",
//               "tag": "lark_md"
//             }
//           },
//           {
//             "actions": [{
//               "tag": "button",
//               "text": {
//                 "content": "查看构建任务",
//                 "tag": "lark_md"
//               },
//               "url": "${JOB_URL}",
//               "type": "default",
//               "value": {}
//             }],
//             "tag": "action"
//           }
//         ],
//         "header": {
//           "title": {
//             "content": "✨Jenkins构建通知✨",
//             "tag": "plain_text"
//           }
//         }
//       }
//     }'
//   """
// }

def getChangeString() {
  MAX_MSG_LEN = 100
  def changeString = ""
  def changeLogSets = currentBuild.changeSets
  echo "changeLogSets.size: ${changeLogSets.size()}"
  for (int i = 0; i < changeLogSets.size(); i++) {
    def entries = changeLogSets[i].items
    echo "entries: ${entries}"
    for (int j = 0; j < entries.length; j++) {
      def entry = entries[j]
      def authorEmail = entry.author.toString()
      def authorName = getAuthorName(authorEmail)
      truncated_msg = entry.msg.take(MAX_MSG_LEN)
      echo "truncated_msg: ${truncated_msg}"
      changeString += "\\n- ${truncated_msg} [${authorName}]"
      echo "changeString: ${changeString}"
    }
  }
  if (!changeString) {
    changeString = "- 无更新内容"
  }
  return changeString
}

def getAuthorName(email) {
  def atIndex = email.indexOf('@')
  if (atIndex != -1) {
    return email.substring(0, atIndex)
  } else {
    return email
  }
}

def formatDuration(duration) {
  if (duration < 60000) {
    return "${(duration / 1000).toInteger()} 秒"
  } else {
    def minutes = (duration / 60000).toInteger()
    def seconds = ((duration % 60000) / 1000).toInteger()
    return "${minutes} 分 ${seconds} 秒"
  }
}

def formatTimestamp(timestamp) {
  def formattedDate = new Date(timestamp)
  def formattedString = formattedDate.format("yyyy-MM-dd HH:mm:ss", TimeZone.getTimeZone("Asia/Shanghai"))
  return formattedString
}
