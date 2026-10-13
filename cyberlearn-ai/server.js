require("dotenv").config();
const path=require("path"),fs=require("fs"),express=require("express"),session=require("express-session");
const SQLiteStore=require("connect-sqlite3")(session),Database=require("better-sqlite3"),bcrypt=require("bcryptjs"),helmet=require("helmet"),rateLimit=require("express-rate-limit");
const app=express(),PORT=Number(process.env.PORT||3000),prod=process.env.NODE_ENV==="production",secret=process.env.SESSION_SECRET||"";
if(prod&&secret.length<32){console.error("SESSION_SECRET debe tener 32+ caracteres en producción.");process.exit(1)}
if(!prod&&secret.length<32)console.warn("Aviso: cambia SESSION_SECRET en .env.");
if(process.env.TRUST_PROXY==="1")app.set("trust proxy",1);
const dataDir=path.resolve(__dirname,"data");fs.mkdirSync(dataDir,{recursive:true});
const dbPath=path.resolve(__dirname,process.env.DATABASE_FILE||"./data/cyberlearn.sqlite");fs.mkdirSync(path.dirname(dbPath),{recursive:true});
const db=new Database(dbPath);db.pragma("journal_mode=WAL");db.pragma("foreign_keys=ON");
db.exec(`CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE COLLATE NOCASE,password_hash TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT(datetime('now')));
CREATE TABLE IF NOT EXISTS progress(user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,technique_id INTEGER NOT NULL CHECK(technique_id BETWEEN 1 AND 25),completed_at TEXT NOT NULL DEFAULT(datetime('now')),PRIMARY KEY(user_id,technique_id));`);
app.disable("x-powered-by");
app.use(helmet({contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'"],imgSrc:["'self'","data:"],connectSrc:["'self'"],objectSrc:["'none'"],baseUri:["'self'"],frameAncestors:["'none'"],formAction:["'self'"]}}}));
app.use(express.json({limit:"20kb"}));app.use(express.urlencoded({extended:false,limit:"20kb"}));
app.use("/api/auth",rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:"draft-7",legacyHeaders:false,message:{error:"Demasiados intentos. Espera unos minutos."}}));
app.use(session({name:"cyberlearn.sid",secret:secret||"solo-desarrollo-cambia-este-secreto",resave:false,saveUninitialized:false,rolling:true,store:new SQLiteStore({db:"sessions.sqlite",dir:dataDir,concurrentDB:true}),cookie:{httpOnly:true,secure:prod,sameSite:"lax",maxAge:8*60*60*1000}}));
app.use("/api",(req,res,next)=>{if(!["POST","PUT","PATCH","DELETE"].includes(req.method))return next();const origin=req.get("origin");if(origin&&origin!==`${req.protocol}://${req.get("host")}`)return res.status(403).json({error:"Origen no permitido."});next()});
const userByEmail=db.prepare("SELECT id,name,email,password_hash FROM users WHERE email=?");
const publicUser=db.prepare("SELECT id,name,email,created_at FROM users WHERE id=?");
const createUser=db.prepare("INSERT INTO users(name,email,password_hash) VALUES(?,?,?)");
const getProgress=db.prepare("SELECT technique_id FROM progress WHERE user_id=? ORDER BY technique_id");
const addProgress=db.prepare("INSERT OR IGNORE INTO progress(user_id,technique_id) VALUES(?,?)");
const removeProgress=db.prepare("DELETE FROM progress WHERE user_id=? AND technique_id=?");
const clearProgress=db.prepare("DELETE FROM progress WHERE user_id=?");
function auth(req,res,next){if(!req.session.userId)return res.status(401).json({error:"Inicia sesión para continuar."});next()}
function emailOK(e){return typeof e==="string"&&e.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)}
function normalizeEmail(e){return typeof e==="string"?e.trim().toLowerCase():""}
function normalizeName(n){return typeof n==="string"?n.trim().replace(/\s+/g," ").slice(0,60):""}
app.get("/api/health",(_req,res)=>res.json({ok:true}));
app.get("/api/auth/me",(req,res)=>{if(!req.session.userId)return res.json({user:null});const u=publicUser.get(req.session.userId);if(!u)return req.session.destroy(()=>res.json({user:null}));res.json({user:u})});
app.post("/api/auth/register",(req,res,next)=>{
 const name=normalizeName(req.body.name),email=normalizeEmail(req.body.email),password=req.body.password;
 if(name.length<2)return res.status(400).json({error:"El nombre debe tener al menos 2 caracteres."});
 if(!emailOK(email))return res.status(400).json({error:"Introduce un correo válido."});
 if(typeof password!=="string"||password.length<12||password.length>72)return res.status(400).json({error:"La contraseña debe tener entre 12 y 72 caracteres."});
 try{const result=createUser.run(name,email,bcrypt.hashSync(password,12));req.session.regenerate(err=>{if(err)return next(err);req.session.userId=Number(result.lastInsertRowid);req.session.save(e=>{if(e)return next(e);res.status(201).json({user:publicUser.get(req.session.userId)})})})}
 catch(e){if(String(e.code).includes("SQLITE_CONSTRAINT_UNIQUE"))return res.status(409).json({error:"Ya existe una cuenta con ese correo."});next(e)}
});
app.post("/api/auth/login",(req,res,next)=>{
 const email=normalizeEmail(req.body.email),password=req.body.password;
 if(!emailOK(email)||typeof password!=="string"||password.length>72)return res.status(400).json({error:"Correo o contraseña no válidos."});
 const u=userByEmail.get(email);const dummy="$2a$12$C6UzMDM.H6dfI/f/IKcEe.0QY4v4M5Q6zGq2zQ4L8mR2u5Y9sP9uK";
 const ok=bcrypt.compareSync(password,u?u.password_hash:dummy);
 if(!u||!ok)return res.status(401).json({error:"Correo o contraseña incorrectos."});
 req.session.regenerate(err=>{if(err)return next(err);req.session.userId=u.id;req.session.save(e=>{if(e)return next(e);res.json({user:publicUser.get(u.id)})})});
});
app.post("/api/auth/logout",auth,(req,res)=>req.session.destroy(err=>{if(err)return res.status(500).json({error:"No se pudo cerrar sesión."});res.clearCookie("cyberlearn.sid",{httpOnly:true,secure:prod,sameSite:"lax"});res.status(204).end()}));
app.get("/api/progress",auth,(req,res)=>res.json({completed:getProgress.all(req.session.userId).map(r=>r.technique_id)}));
app.put("/api/progress/:id",auth,(req,res)=>{const id=Number(req.params.id);if(!Number.isInteger(id)||id<1||id>25)return res.status(400).json({error:"ID no válido."});addProgress.run(req.session.userId,id);res.json({completed:getProgress.all(req.session.userId).map(r=>r.technique_id)})});
app.delete("/api/progress/:id",auth,(req,res)=>{const id=Number(req.params.id);if(!Number.isInteger(id)||id<1||id>25)return res.status(400).json({error:"ID no válido."});removeProgress.run(req.session.userId,id);res.json({completed:getProgress.all(req.session.userId).map(r=>r.technique_id)})});
app.delete("/api/progress",auth,(req,res)=>{clearProgress.run(req.session.userId);res.json({completed:[]})});
const publicDir=path.join(__dirname,"public");app.use(express.static(publicDir,{extensions:["html"]}));
app.get("*",(req,res,next)=>{if(req.path.startsWith("/api/"))return res.status(404).json({error:"Ruta API no encontrada"});res.sendFile(path.join(publicDir,"index.html"),e=>e&&next(e))});
app.use((err,_req,res,_next)=>{console.error(err);if(!res.headersSent)res.status(500).json({error:"Error interno del servidor."})});
app.listen(PORT,()=>console.log(`CyberLearn AI: http://localhost:${PORT}`));
