import * as bcrypt from 'bcrypt';
import passport from 'passport';
import passportLocal from 'passport-local';
import logger from '../../etc/logger';
import User from '../../models/user.model';

// passport-local 설정
const LocalStrategy = passportLocal.Strategy;

export default () => {
    passport.use(
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
            },
            async (email: any, password: any, done: any) => {
                try {
                    const findUser = await User.findOne({ email: email });
                    if (!findUser)
                        done(null, false, { message: '가입되지 않은 회원입니다.' });
                    else {
                        const result = await bcrypt.compare(password, findUser.password);
                        logger.info(`passport_local_login_result: ${result}`)
                        result
                            ? done(null, findUser)
                            : done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
                    }
                } catch (error) {
                    logger.info(`passport_local_login_error: ${error}`)
                    done(error);
                }
            },
        ),
    )
}