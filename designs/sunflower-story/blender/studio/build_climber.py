"""Rigged masked comic hero and deterministic eight-second wall-climb animation.
Targets stay independent of the rig: planted wrists/ankles are fixed between reaches.
"""
import bpy, math, os, json
from mathutils import Vector,Matrix
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT=os.path.join(ROOT,'assets','hero');QA=os.path.join(ROOT,'qa','climb');os.makedirs(OUT,exist_ok=True);os.makedirs(QA,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;scene.name='Rigged wall climb';scene.render.fps=24;scene.frame_end=193
collection=bpy.data.collections.new('WallClimbCharacter');scene.collection.children.link(collection)
parts=[]
def material(name,color):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=.84;return m
navy=material('Suit charcoal',(.024,.034,.061));panel=material('Woven blue panels',(.045,.068,.115));red=material('Crimson suit seams',(.58,.009,.022));ink=material('Ink seams',(.005,.008,.019));eye=material('Mask ivory eyes',(.93,.91,.8));sole=material('Sole rubber',(.085,.092,.105));shoe=material('Sneaker crimson suede',(.42,.013,.026));cream=material('Sneaker warm sole',(.56,.52,.46))
def obj_mesh(name,verts,faces,mat,bone):
 me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new(name,me);collection.objects.link(o);o.data.materials.append(mat)
 for poly in me.polygons:poly.use_smooth=True
 vg=o.vertex_groups.new(name=bone);vg.add(list(range(len(verts))),1,'REPLACE');parts.append(o);return o

def ellipsoid(name,center,radii,mat,bone,rings=10,seg=20):
 verts=[];faces=[]
 for j in range(rings+1):
  th=math.pi*j/rings
  for i in range(seg):
   az=math.tau*i/seg;verts.append((center[0]+radii[0]*math.sin(th)*math.cos(az),center[1]+radii[1]*math.sin(th)*math.sin(az),center[2]+radii[2]*math.cos(th)))
 for j in range(rings):
  for i in range(seg):faces.append((j*seg+i,(j+1)*seg+i,(j+1)*seg+(i+1)%seg,j*seg+(i+1)%seg))
 return obj_mesh(name,verts,faces,mat,bone)
def tube(name,a,b,r,mat,bone,profile=None):
 a=Vector(a);b=Vector(b);d=b-a;q=d.to_track_quat('Z','Y');verts=[];faces=[];seg=14
 profile=profile or [(0,.5),(.08,.86),(.3,1),(.65,.85),(.92,.67),(1,.4)]
 for t,ratio in profile:
  for i in range(seg):
   angle=math.tau*i/seg;p=a+d*t+q@Vector((math.cos(angle)*r*ratio,math.sin(angle)*r*ratio,0));verts.append(tuple(p))
 for j in range(len(profile)-1):
  for i in range(seg):faces.append((j*seg+i,j*seg+(i+1)%seg,(j+1)*seg+(i+1)%seg,(j+1)*seg+i))
 faces.extend([tuple(range(seg-1,-1,-1)),tuple((len(profile)-1)*seg+i for i in range(seg))]);return obj_mesh(name,verts,faces,mat,bone)
def stroke(name,points,r,mat,bone):
 for a,b in zip(points,points[1:]):tube(name,a,b,r,mat,bone,[(0,1),(1,1)])

def continuous_limb(name,upper,lower,radii):
 # One continuous surface across each joint, with a smooth two-bone blend.
 a,j=bones[upper];_,b=bones[lower];vertices=[];faces=[];weights=[];segments=24
 sections=[(0,.80),(.08,1),(.23,1.02),(.42,.91),(.62,.80),(.83,.72),(1,.70)]
 for half,(start,end) in enumerate([(a,j),(j,b)]):
  d=end-start;q=d.to_track_quat('Z','Y')
  for step,(t,shape) in enumerate(sections):
   if half and step==0:continue
   radius=radii[half]*shape
   if half==1:radius=radii[0]*.70*(1-t)+radii[1]*shape*t
   for k in range(segments):
    angle=math.tau*k/segments
    vertices.append(tuple(start+d*t+q@Vector((math.cos(angle)*radius,math.sin(angle)*radius*.90,0))))
    w=(.5*ramp(t,.70,1)) if half==0 else (.5+.5*ramp(t,0,.30));weights.append(w)
 rows=len(vertices)//segments
 for row in range(rows-1):
  for k in range(segments):faces.append((row*segments+k,row*segments+(k+1)%segments,(row+1)*segments+(k+1)%segments,(row+1)*segments+k))
 faces.extend([tuple(range(segments-1,-1,-1)),tuple((rows-1)*segments+k for k in range(segments))])
 o=obj_mesh(name,vertices,faces,navy,upper);o.vertex_groups.clear();u=o.vertex_groups.new(name=upper);l=o.vertex_groups.new(name=lower)
 for index,w in enumerate(weights):
  if w<1:u.add([index],1-w,'REPLACE')
  if w>0:l.add([index],w,'REPLACE')
 # Subdivision rounds the authored silhouette before armature deformation.
 bpy.context.view_layer.objects.active=o;mod=o.modifiers.new('Tailored continuous silhouette','SUBSURF');mod.levels=2;bpy.ops.object.modifier_apply(modifier=mod.name)
 return o

def ramp(t,a,b):
 q=min(1,max(0,(t-a)/(b-a)));return .5-.5*math.cos(math.pi*q)
# Armature in a regular rest pose, Z up, facing positive Y (toward the wall).
arm=bpy.data.armatures.new('Comic climber skeleton');rig=bpy.data.objects.new('ComicClimber',arm);collection.objects.link(rig);bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
bones={}
def bone(name,a,b,parent=None):
 e=arm.edit_bones.new(name);e.head=a;e.tail=b
 if parent:e.parent=arm.edit_bones[parent]
 bones[name]=(Vector(a),Vector(b));return e
bone('root',(0,0,0),(0,0,.18));bone('spine',(0,0,.06),(0,0,.4),'root');bone('chest',(0,0,.4),(0,0,.67),'spine');bone('neck',(0,0,.67),(0,0,.81),'chest');bone('head',(0,0,.81),(0,0,1.07),'neck')
for side,sign in [('L',-1),('R',1)]:
 shoulder=(sign*.27,0,.6);elbow=(sign*.46,-.04,.2);wrist=(sign*.58,0,-.25)
 bone('upper_arm_'+side,shoulder,elbow,'chest');bone('forearm_'+side,elbow,wrist,'upper_arm_'+side);bone('hand_'+side,wrist,(wrist[0],.12,wrist[2]),'forearm_'+side)
 hip=(sign*.16,0,-.035);knee=(sign*.18,-.035,-.6);ankle=(sign*.18,0,-1.17)
 bone('thigh_'+side,hip,knee,'root');bone('shin_'+side,knee,ankle,'thigh_'+side);bone('foot_'+side,ankle,(ankle[0],.16,ankle[2]-.035),'shin_'+side)
 for f,length in enumerate([.074,.086,.079,.061]):bone(f'finger_{side}_{f}',(wrist[0]+(f-1.5)*.023,.065,wrist[2]),(wrist[0]+(f-1.5)*.023,.065+length,wrist[2]),'hand_'+side)
bone('fabric_tab',(.13,-.13,.03),(.2,-.15,-.1),'root')
bpy.ops.object.mode_set(mode='OBJECT');rig.select_set(False)
# Sculpted torso cross sections, with blended spine weights.
verts=[];faces=[];levels=[(-.075,.164,.105),(0,.179,.114),(.07,.178,.109),(.12,.161,.103),(.2,.165,.114),(.3,.188,.133),(.4,.23,.147),(.5,.267,.15),(.58,.28,.134),(.65,.247,.11),(.69,.14,.075),(.72,.074,.07)];seg=40
for z,rx,ry in levels:
 for i in range(seg):
  a=math.tau*i/seg;x=math.cos(a)*rx;y=math.sin(a)*ry
  if y<0:
   scapula=.021*math.exp(-((abs(x)-.105)/.075)**2-((z-.51)/.11)**2)
   spine=.012*math.exp(-(x/.033)**2-((z-.46)/.20)**2)
   y+=spine-scapula
  verts.append((x,y,z))
for j in range(len(levels)-1):
 for i in range(seg):faces.append((j*seg+i,j*seg+(i+1)%seg,(j+1)*seg+(i+1)%seg,(j+1)*seg+i))
faces.extend([tuple(range(seg-1,-1,-1)),tuple((len(levels)-1)*seg+i for i in range(seg))]);torso=obj_mesh('Anatomical suit torso',verts,faces,navy,'root');torso.vertex_groups.clear()
for name in ['root','spine','chest']:torso.vertex_groups.new(name=name)
for i,p in enumerate(verts):
 z=p[2]
 if z<.12:torso.vertex_groups['root'].add([i],1,'REPLACE')
 elif z<.4:
  w=(z-.12)/.28;torso.vertex_groups['spine'].add([i],1-w,'REPLACE');torso.vertex_groups['chest'].add([i],w,'REPLACE')
 else:torso.vertex_groups['chest'].add([i],1,'REPLACE')
bpy.context.view_layer.objects.active=torso;mod=torso.modifiers.new('Torso sculpt smoothing','SUBSURF');mod.levels=2;bpy.ops.object.modifier_apply(modifier=mod.name)
# Back tailoring follows the torso: shoulder yoke, side panels and waist wrinkles.
for sign in [-1,1]:
 stroke('Crimson shoulder yoke',[(sign*.045,-.115,.65),(sign*.11,-.142,.61),(sign*.20,-.136,.575),(sign*.255,-.10,.55)],.008,red,'chest')
 stroke('Tailored scapula seam',[(sign*.06,-.148,.55),(sign*.14,-.148,.49),(sign*.205,-.12,.36)],.0035,panel,'chest')
 stroke('Blue side contour',[(sign*.22,-.095,.43),(sign*.185,-.097,.26),(sign*.143,-.085,.15)],.008,panel,'spine')
 for z in [.05,.075,.1]:stroke('Waist fabric fold',[(sign*.025,-.122,z),(sign*.075,-.119,z+.01),(sign*.135,-.086,z+.018)],.003,panel,'root')
back_details=list(parts[1:])
ellipsoid('Tailored pelvis',(0,0,-.055),(.181,.115,.13),navy,'root',16,28)
ellipsoid('Neck suit',(0,0,.745),(.074,.074,.105),navy,'neck',16,24)
# Narrow chin and fuller cranium instead of a spherical placeholder mask.
hv=[];hf=[];hs=36
head_levels=[(.754,.054,.066,.015),(.79,.095,.086,.011),(.85,.126,.11,.005),(.93,.143,.13,0),(1.02,.145,.135,-.004),(1.10,.119,.113,-.007),(1.145,.057,.055,-.006),(1.155,.004,.004,-.006)]
for z,rx,ry,cy in head_levels:
 for i in range(hs):
  a=math.tau*i/hs;hv.append((rx*math.cos(a),cy+ry*math.sin(a),z))
for j in range(7):
 for i in range(hs):hf.append((j*hs+i,j*hs+(i+1)%hs,(j+1)*hs+(i+1)%hs,(j+1)*hs+i))
head=obj_mesh('Sculpted mask silhouette',hv,hf,navy,'head');bpy.context.view_layer.objects.active=head;mod=head.modifiers.new('Mask sculpt smoothing','SUBSURF');mod.levels=2;bpy.ops.object.modifier_apply(modifier=mod.name)
def mask_point(th,az):
 z=.955+.195*math.cos(th)
 for a,b in zip(head_levels,head_levels[1:]):
  if a[0]<=z<=b[0]:
   q=(z-a[0])/(b[0]-a[0]);rx=a[1]*(1-q)+b[1]*q;ry=a[2]*(1-q)+b[2]*q;cy=a[3]*(1-q)+b[3]*q
   return ((rx+.0005)*math.cos(az),cy+(ry+.0005)*math.sin(az),z)
 return (0,0,z)
# Mask web construction lines follow the actual curved surface.
mask_start=len(parts)
for az in [0,.65,1.2,1.9,2.6,3.25,3.9,4.6,5.3]:
 points=[]
 for j in range(15):
  th=.2+j*(math.pi-.4)/14;points.append(mask_point(th,az))
 stroke('Mask drawn web',points,.0019,red,'head')
for th in [.7,1.2,1.7,2.2]:
 points=[mask_point(th,math.tau*i/30) for i in range(31)];stroke('Mask web ring',points,.0018,red,'head')
mask_bvh=BVHTree.FromObject(head,bpy.context.evaluated_depsgraph_get())
for o in parts[mask_start:]:
 for v in o.data.vertices:
  hit=mask_bvh.find_nearest(v.co)
  if hit[0] is not None:v.co=hit[0]+hit[1]*.0013
def eye_patch(name,corners,mat,offset):
 vertices=[];faces=[];nu=6;nv=4
 for j in range(nv+1):
  v=j/nv
  for i in range(nu+1):
   u=i/nu;p=Vector(corners[0])*(1-u)*(1-v)+Vector(corners[1])*u*(1-v)+Vector(corners[2])*u*v+Vector(corners[3])*(1-u)*v
   hit=mask_bvh.ray_cast(Vector((p.x,1,p.z)),Vector((0,-1,0)))
   vertices.append(tuple(hit[0]+hit[1]*offset if hit[0] is not None else p))
 for j in range(nv):
  for i in range(nu):a=j*(nu+1)+i;faces.append((a,a+1,a+nu+2,a+nu+1))
 return obj_mesh(name,vertices,faces,mat,'head')
for sign in [-1,1]:
 # Raised graphic eye shape and ink border, on the wall-facing mask.
 outer=[(sign*.018,.14,1.007),(sign*.12,.102,1.039),(sign*.107,.116,.94),(sign*.04,.139,.956)]
 inner=[(sign*.032,.145,1.006),(sign*.108,.117,1.025),(sign*.096,.128,.952),(sign*.047,.146,.967)]
 eye_patch('Eye ink rim',outer,red,.0025);eye_patch('Graphic mask eye',inner,eye,.0035)
# Continuous limbs, tailored suit panels and layered street sneakers.
for side,sign in [('L',-1),('R',1)]:
 continuous_limb('Continuous arm '+side,'upper_arm_'+side,'forearm_'+side,(.084,.069))
 continuous_limb('Continuous leg '+side,'thigh_'+side,'shin_'+side,(.118,.083))
 shoulder=ellipsoid('Sculpted shoulder '+side,(sign*.263,0,.585),(.086,.093,.103),navy,'chest',16,24)
 vg=shoulder.vertex_groups.new(name='upper_arm_'+side)
 for v in shoulder.data.vertices:
  w=max(.15,min(.85,(abs(v.co.x)-.21)/.11));shoulder.vertex_groups['chest'].add([v.index],1-w,'REPLACE');vg.add([v.index],w,'REPLACE')
 ellipsoid('Hip contour '+side,(sign*.105,-.006,-.06),(.112,.12,.143),navy,'root',16,24)
 for part,r,mat in [('upper_arm',.083,navy),('forearm',.072,panel),('thigh',.12,navy),('shin',.09,panel)]:
  a,b=bones[part+'_'+side]
  d=b-a;offset=Vector((sign*r*.65,-r*.45,0));stroke('Red suit seam',[a+d*.12+offset,a+d*.6+offset,b-d*.12+offset],.007,red,part+'_'+side)
  for f in [.23,.6]:
   c=a+d*f;stroke('Suit construction seam',[c+Vector((-r*.5,-r*.6,0)),c+Vector((0,-r*.96,0)),c+Vector((r*.5,-r*.6,0))],.003,ink,part+'_'+side)
 wrist=bones['hand_'+side][0];ellipsoid('Palm',tuple(wrist+Vector((0,.048,0))),(.057,.06,.026),navy,'hand_'+side,12,24)
 ellipsoid('Glove back panel',tuple(wrist+Vector((0,.05,-.025))),(.046,.046,.003),red,'hand_'+side,10,20)
 for f in range(4):
  a,b=bones[f'finger_{side}_{f}'];tube('Finger',a,b,.011,navy,f'finger_{side}_{f}',[(0,.95),(.12,1),(.43,.92),(.53,1),(.83,.79),(1,.35)]);ellipsoid('Glove knuckle',tuple(a+Vector((0,.009,-.019))),(.011,.014,.006),navy,f'finger_{side}_{f}',8,12)
 stroke('Articulated thumb',[wrist+Vector((sign*.047,.015,0)),wrist+Vector((sign*.077,.044,-.004)),wrist+Vector((sign*.073,.088,-.007))],.014,navy,'hand_'+side)
 ankle=bones['foot_'+side][0];foot='foot_'+side
 ellipsoid('High top sneaker upper',tuple(ankle+Vector((0,.065,-.008))),(.082,.14,.067),shoe,foot,16,28)
 ellipsoid('Padded ankle collar',tuple(ankle+Vector((0,-.005,.058))),(.076,.074,.08),shoe,foot,14,24)
 ellipsoid('Ivory layered midsole',tuple(ankle+Vector((0,.07,-.061))),(.086,.148,.018),cream,foot,10,28)
 ellipsoid('Rubber tread',tuple(ankle+Vector((0,.072,-.08))),(.085,.147,.012),sole,foot,8,24)
 ellipsoid('Toe cap suede',tuple(ankle+Vector((0,.173,-.017))),(.075,.035,.039),red,foot,12,20)
 for y in [.005,.037,.069,.10]:
  stroke('Sneaker lace',[ankle+Vector((-.046,y,.05)),ankle+Vector((.046,y+.017,.05))],.004,cream,foot)
 for k in range(5):
  y=-.025+k*.045;stroke('Sole tread grooves',[ankle+Vector((-.077,y,-.079)),ankle+Vector((.077,y,-.079))],.0025,ink,foot)
 for s in [-1,1]:
  stroke('Sneaker side piping',[ankle+Vector((s*.077,-.035,.025)),ankle+Vector((s*.083,.05,.012)),ankle+Vector((s*.064,.16,-.022))],.003,cream,foot)
# Red back emblem with eight drawn legs, entirely on the chest bone.
emblem_start=len(parts)
ellipsoid('Spider abdomen',(0,-.152,.415),(.036,.003,.065),red,'chest',8,14);ellipsoid('Spider head',(0,-.151,.48),(.024,.003,.027),red,'chest',6,12)
for sign in [-1,1]:
 for dz,endz in [(.07,.63),(.02,.53),(-.015,.33),(-.045,.23)]:stroke('Spider leg',[(sign*.024,-.161,.44+dz),(sign*.11,-.16,.46+dz),(sign*.2,-.135,endz)],.0035,red,'chest')
# Printed fabric details use a UV texture, avoiding raised wires and z-fighting.
back_details.extend(parts[emblem_start:])
for o in back_details:parts.remove(o);bpy.data.objects.remove(o,do_unlink=True)
# Fuse the anatomical core into a single surface so shoulders/hips have no part seams.
core=[o for o in parts if o is torso or o.name.startswith(('Continuous ','Sculpted shoulder','Hip contour','Tailored pelvis','Neck suit'))]
bpy.ops.object.select_all(action='DESELECT')
for o in core:o.select_set(True)
for o in core:
 if o is not torso:parts.remove(o)
bpy.context.view_layer.objects.active=torso;bpy.ops.object.join()
group_names=[g.name for g in torso.vertex_groups];source_weights=[{group_names[g.group]:g.weight for g in v.groups} for v in torso.data.vertices]
tree=KDTree(len(torso.data.vertices))
for v in torso.data.vertices:tree.insert(v.co,v.index)
tree.balance()
mod=torso.modifiers.new('Unified anatomical sculpt','REMESH');mod.mode='VOXEL';mod.voxel_size=.009;mod.use_smooth_shade=True;mod.use_remove_disconnected=False;bpy.ops.object.modifier_apply(modifier=mod.name)
mod=torso.modifiers.new('Surface sculpt relaxation','SMOOTH');mod.factor=.48;mod.iterations=4;bpy.ops.object.modifier_apply(modifier=mod.name)
sculpt_weights=[]
for v in torso.data.vertices:
 weights={}
 for co,index,d in tree.find_n(v.co,4):
  influence=1/max(d,.002)**2
  for name,w in source_weights[index].items():weights[name]=weights.get(name,0)+w*influence
 total=sum(weights.values());sculpt_weights.append({name:w/total for name,w in weights.items()})
# Diffuse transferred weights across the unified surface to avoid pinched seams.
neighbors=[set() for v in torso.data.vertices]
for edge in torso.data.edges:
 a,b=edge.vertices;neighbors[a].add(b);neighbors[b].add(a)
for iteration in range(6):
 relaxed=[]
 for index,weights in enumerate(sculpt_weights):
  result={name:.55*w for name,w in weights.items()};adj=neighbors[index]
  for other in adj:
   for name,w in sculpt_weights[other].items():result[name]=result.get(name,0)+.45*w/max(1,len(adj))
  relaxed.append(result)
 sculpt_weights=relaxed
torso.vertex_groups.clear()
for name in group_names:torso.vertex_groups.new(name=name)
for v,weights in zip(torso.data.vertices,sculpt_weights):
 strongest=sorted(weights.items(),key=lambda item:item[1],reverse=True)[:4];total=sum(w for _,w in strongest)
 for name,w in strongest:
  if w>1e-6:torso.vertex_groups[name].add([v.index],w/total,'REPLACE')
print('SCULPT_CORE',len(torso.data.vertices),'vertices',flush=True)
uv=torso.data.uv_layers.new(name='Tailored suit UV')
for poly in torso.data.polygons:
 for li in poly.loop_indices:
  p=torso.data.vertices[torso.data.loops[li].vertex_index].co;uv.data[li].uv=((p.x+.3)/.6,(p.z+.1)/.82)
lines=[]
for sign in [-1,1]:
 for dz,endz in [(.07,.63),(.02,.53),(-.015,.33),(-.045,.23)]:
  pts=[(sign*.024,.44+dz),(sign*.11,.46+dz),(sign*.20,endz)]
  for a,b in zip(pts,pts[1:]):lines.append((a,b,.0045,'red'))
 for a,b in zip([(sign*.045,.65),(sign*.11,.61),(sign*.20,.575)],[(sign*.11,.61),(sign*.20,.575),(sign*.255,.55)]):lines.append((a,b,.006,'red'))
 for a,b in zip([(sign*.06,.55),(sign*.14,.49),(sign*.205,.36)],[(sign*.14,.49),(sign*.205,.36),(sign*.205,.32)]):lines.append((a,b,.003,'blue'))
 for z in [.05,.075,.1]:lines.append(((sign*.025,z),(sign*.135,z+.018),.002,'blue'))
def segment_distance(x,z,a,b):
 dx=b[0]-a[0];dz=b[1]-a[1];q=max(0,min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return (x-a[0]-q*dx)**2+(z-a[1]-q*dz)**2
pixels=[];tw=384;th=512
for j in range(th):
 z=-.1+.82*j/(th-1)
 for i in range(tw):
  x=-.3+.6*i/(tw-1);weave=.97+.03*math.sin(i*2.1)*math.sin(j*2.3);edge=1+.15*abs(x)/.3
  muscle=1+.28*math.exp(-((abs(x)-.115)/.065)**2-((z-.52)/.115)**2)-.22*math.exp(-(x/.025)**2-((z-.40)/.23)**2)
  rib=.92+.08*math.cos((z-.20)*110)*math.exp(-((z-.16)/.07)**2)
  color=(.085*weave*edge*muscle*rib,.11*weave*edge*muscle*rib,.175*weave*edge*muscle*rib)
  if (x/.03)**2+((z-.415)/.056)**2<1 or (x/.021)**2+((z-.478)/.025)**2<1:color=(.64,.013,.028)
  for a,b,r,kind in lines:
   if x<min(a[0],b[0])-r or x>max(a[0],b[0])+r or z<min(a[1],b[1])-r or z>max(a[1],b[1])+r:continue
   if segment_distance(x,z,a,b)<r*r:color=(.64,.013,.028) if kind=='red' else (.12,.16,.235)
  pixels.extend((*color,1))
fabric=bpy.data.images.new('Inked woven suit atlas',width=tw,height=th);fabric.pixels=pixels;fabric.pack()
textile=navy.copy();textile.name='Printed woven torso';p=textile.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(1,1,1,1);tex=textile.node_tree.nodes.new('ShaderNodeTexImage');tex.image=fabric;textile.node_tree.links.new(tex.outputs['Color'],p.inputs['Base Color']);torso.data.materials.clear();torso.data.materials.append(navy);torso.data.materials.append(textile)
for poly in torso.data.polygons:
 center=sum((torso.data.vertices[k].co for k in poly.vertices),Vector())/len(poly.vertices)
 torso_weight=sum(sum(g.weight for g in torso.data.vertices[k].groups if torso.vertex_groups[g.group].name in ['root','spine','chest']) for k in poly.vertices)/len(poly.vertices)
 poly.material_index=1 if 0<center.z<.71 and abs(center.x)<.30 and torso_weight>.75 else 0
# Small cloth tab is a separate secondary-motion bone, not a cloth simulation.
obj_mesh('Fabric tab',[(.13,-.14,.02),(.19,-.14,.01),(.22,-.15,-.14),(.17,-.15,-.16)],[(0,1,2,3)],red,'fabric_tab')
# Join weighted pieces into one skinned mesh, preserving all bone groups/materials.
bpy.ops.object.select_all(action='DESELECT')
for o in parts:o.select_set(True)
bpy.context.view_layer.objects.active=torso;bpy.ops.object.join();body=bpy.context.object;body.name='ComicHeroSkin';body.data.validate(clean_customdata=False);body.data.update();modifier=body.modifiers.new('Character armature','ARMATURE');modifier.object=rig;body.parent=rig
# Independent hand and foot controllers and bend-plane targets.
controllers={}
for side,sign in [('L',-1),('R',1)]:
 for limb,lower in [('hand','forearm'),('foot','shin')]:
  target=bpy.data.objects.new(limb+'_'+side+'_IK',None);collection.objects.link(target);target.empty_display_type='SPHERE';target.empty_display_size=.05;controllers[limb+'_'+side]=target
  pole=bpy.data.objects.new(limb+'_'+side+'_pole',None);collection.objects.link(pole);pole.empty_display_size=.03
  pole.location=(sign*(.7 if limb=='hand' else .28),-.8,.32 if limb=='hand' else -.55)
  c=rig.pose.bones[lower+'_'+side].constraints.new('IK');c.target=target;c.pole_target=pole;c.chain_count=2;c.use_stretch=False;c.iterations=100;c.pole_angle=0
  c=rig.pose.bones[limb+'_'+side].constraints.new('COPY_ROTATION');c.target=target;c.target_space='WORLD';c.owner_space='WORLD'
for p in rig.pose.bones:p.rotation_mode='XYZ'
def contact_targets(t):
 result={}
 for name,x,z,amount,a,b in [('hand_R',.43,.87,.60,.12,.35),('foot_L',-.21,-.83,.45,.35,.52),('hand_L',-.43,1,.70,.52,.72),('foot_R',.21,-.62,.50,.72,.92)]:
  q=ramp(t,a,b);lift=.20*math.sin(math.pi*q);y=(.50 if name.startswith('hand') else .42)-lift
  result[name]=((x,y,z+amount*q),not(a<t<b))
 return result
def body_track(t):
 # Anticipate on the anchored side, then lift the hips after the reaching hand plants.
 keys=[(0,0,0),(.09,-.025,-.014),(.20,-.035,.045),(.34,-.022,.18),(.47,.032,.265),(.52,.028,.26),(.65,.035,.38),(.77,-.022,.46),(.93,-.032,.54),(1,-.02,.54)]
 for a,b in zip(keys,keys[1:]):
  if a[0]<=t<=b[0]:
   q=ramp(t,a[0],b[0]);return (a[1]*(1-q)+b[1]*q,a[2]*(1-q)+b[2]*q)
 return keys[-1][1:]
records=[]
for frame in range(1,194):
 t=(frame-1)/192;scene.frame_set(frame)
 shift,rise=body_track(t)
 root=rig.pose.bones['root'];root.location=arm.bones['root'].matrix_local.to_3x3().inverted() @ Vector((shift,.022+.025*math.sin(t*math.pi),rise));root.rotation_euler=(.035*math.sin(t*math.tau),shift*.7,-shift*.8)
 root.keyframe_insert(data_path='location');root.keyframe_insert(data_path='rotation_euler')
 for name in ['spine','chest','neck','head','fabric_tab']:
  pb=rig.pose.bones[name];pb.rotation_euler=(.04*math.sin(t*math.tau+(.6 if name=='chest' else 0)),shift*.5,.04*math.sin(t*math.tau))
  if name=='head':pb.rotation_euler=(-.10-.08*math.sin(t*math.pi),.22*math.sin(t*math.tau),-.035*math.sin(t*math.tau))
  if name=='fabric_tab':pb.rotation_euler=(.13*math.sin(t*math.tau*2),.08*math.sin(t*math.tau*3),0)
  pb.keyframe_insert(data_path='rotation_euler')
 targets=contact_targets(t)
 for name,(point,contact) in targets.items():
  controllers[name].location=point;controllers[name].keyframe_insert(data_path='location')
  if name.startswith('hand'):
   side=name[-1]
   for f in range(4):
    a,b=(.12,.35) if side=='R' else (.52,.72);q=ramp(t,a,b);curl=.08-.06*math.sin(q*math.pi)
    pb=rig.pose.bones[f'finger_{side}_{f}'];pb.rotation_euler=(curl,0,0);pb.keyframe_insert(data_path='rotation_euler')
 bpy.context.view_layer.update()
 sample={'frame':frame,'t':t,'body':{'root':list(root.head),'weightShift':shift,'rise':rise},'contacts':{}}
 for name,(target,contact) in targets.items():
  lower=('forearm' if name.startswith('hand') else 'shin')+'_'+name[-1];actual=rig.pose.bones[lower].tail
  sample['contacts'][name]={'target':list(target),'actual':list(actual),'planted':contact,'error':(actual-Vector(target)).length}
 records.append(sample)
# Export constrained motion as a single sampled scene clip.
scene.frame_set(1);bpy.ops.object.select_all(action='DESELECT');rig.select_set(True);body.select_set(True);bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'wall-climber.glb'),export_format='GLB',use_selection=True,export_animations=True,export_force_sampling=True,export_animation_mode='SCENE',export_yup=True,export_bake_animation=True)
with open(os.path.join(OUT,'contact-samples.json'),'w') as f:json.dump(records,f,separators=(',',':'))
# A dedicated source project with controllers and a neutral character-preview camera.
scene.render.engine='CYCLES';scene.cycles.samples=16;scene.cycles.use_denoising=True;scene.render.resolution_x=960;scene.render.resolution_y=960;scene.render.resolution_percentage=100
scene.world.color=(.09,.09,.15)
bpy.ops.object.light_add(type='AREA',location=(3,-4,4));bpy.context.object.data.energy=500;bpy.context.object.data.color=(1,.57,.28);bpy.context.object.data.size=4
bpy.ops.object.light_add(type='AREA',location=(-3,-1,1));bpy.context.object.data.energy=180;bpy.context.object.data.color=(.25,.45,1);bpy.context.object.data.size=3
bpy.ops.object.camera_add(location=(2.5,-4,1.5));camera=bpy.context.object;camera.rotation_euler=(Vector((0,0,.3))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.lens=50;scene.camera=camera
scene.frame_set(100);scene.render.filepath=os.path.join(QA,'rig-preview.png');bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'blender','wall-climber-rig.blend'))
print('RIG_COMPLETE',len(arm.bones),'bones',len(body.data.vertices),'vertices',flush=True)



