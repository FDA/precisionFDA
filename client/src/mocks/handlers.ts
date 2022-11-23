/* eslint-disable import/no-extraneous-dependencies */
import { rest } from 'msw'

export const handlers = [
  rest.get('/assets/*', (re, res, ctx) => res(
    ctx.status(200),
    ctx.json({ 'user': { 'id': 5, 'dxuser': 'precisionfda.admin_dev', 'first_name': 'PrecisionFDA', 'last_name': 'Admin - Dev', 'full_name': 'PrecisionFDA Admin - Dev', 'email': 'pkryshenyk-cf+precisionfda.admin_dev@dnanexus.com', 'admin': true, 'counters': { 'files': 0, 'folders': 0, 'apps': 2, 'workflows': 2, 'jobs': 1, 'assets': 0, 'notes': 0 }, 'links': {}, 'is_guest': false, 'gravatar_url': 'https://secure.gravatar.com/avatar/4a93eb40a70557dec9c5b7582da070fb.png?d=retro\u0026r=PG', 'job_limit': 100, 'pricing_map': { 'baseline-2': 0.286, 'baseline-4': 0.572, 'baseline-8': 1.144, 'baseline-16': 2.288, 'baseline-36': 5.148, 'hidisk-2': 0.372, 'hidisk-4': 0.744, 'hidisk-8': 1.488, 'hidisk-16': 2.976, 'hidisk-36': 6.696, 'himem-2': 0.474, 'himem-4': 0.948, 'himem-8': 1.896, 'himem-16': 3.792, 'himem-32': 7.584, 'gpu-8': 10.787, 'db_std1_x2': 0.273, 'db_mem1_x2': 0.967, 'db_mem1_x4': 1.933, 'db_mem1_x8': 3.867, 'db_mem1_x16': 7.733, 'db_mem1_x32': 15.467, 'db_mem1_x48': 23.2, 'db_mem1_x64': 30.933 }, 'resources': ['baseline-2', 'baseline-4', 'hidisk-2', 'hidisk-4', 'himem-2', 'himem-4'], 'total_limit': 200, 'can_administer_site': true, 'can_create_challenges': true, 'can_see_spaces': true, 'review_space_admin': false, 'can_access_notification_preference': false, 'org': { 'id': 4, 'name': "Admin - Dev's org", 'handle': 'pamellaaccounttwo' }}, 'meta': { 'links': { 'space_create': '/api/spaces', 'space_info': '/api/spaces/info', 'accessible_spaces': '/api/spaces/editable_spaces', 'accessible_apps': '/api/list_apps', 'accessible_workflows': '/api/list_workflows', 'accessible_files': '/api/list_files', 'challenge_new': '/challenges/new' }}}),
  )),
  rest.get('/api/user/cloud_resources', (re, res, ctx) => res(
    ctx.status(200),
    ctx.json({ 'computeCharges': 0.14085349055555696, 'totalCharges': 0.140853902079063, 'storageCharges': 0.0, 'dataEgressCharges': 4.115235060497824e-07, 'usageLimit': 200, 'jobLimit': 100, 'usageAvailable': 199.85914609792093 }),
  )),
  rest.get('/api/list_licenses', (re, res, ctx) => res(
    ctx.status(200),
    ctx.json({ 'licenses':[]}),
  )),
  rest.get('/api/files', (re, res, ctx) => res(
    ctx.status(200),
    ctx.json({ 'files':[{ 'id':4,'name':'open-floorplan.jpg','type':'UserFile','state':'closing','location':'Public','added_by':'Challenge Bot','created_at':'08/24/2022','featured':false,'scope':'public','space_id':null,'origin':'Uploaded','tags':[],'uid':'file-GG2yjZj0PQGQkYvY78bGfGg1-1','file_size':null,'created_at_date_time':'2022-08-24 11:16:05 CEST','description':null,'links':{ 'origin_object':{ 'origin_type':'User','origin_uid':'user-2' },'show':'/files/file-GG2yjZj0PQGQkYvY78bGfGg1-1','user':'/users/challenge.bot.2','track':'/track?id=file-GG2yjZj0PQGQkYvY78bGfGg1-1','download_list':'/api/files/download_list','attach_to':'/api/attach_to_notes','add_file':'/api/create_file','add_folder':'/api/files/create_folder','update':'/api/files','download':'/api/files/file-GG2yjZj0PQGQkYvY78bGfGg1-1/download','copy':'/api/files/copy','feature':'/api/files/feature','organize':'/api/files/move' },'file_license':{},'show_license_pending':false },{ 'id':3,'name':'creative-lighting1-blur.jpg','type':'UserFile','state':'closed','location':'Public','added_by':'PrecisionFDA Admin - Dev','created_at':'08/23/2022','featured':false,'scope':'public','space_id':null,'origin':'Uploaded','tags':[],'uid':'file-GG2Kvf80XVvvgPB2FgvVKBXP-1','file_size':'86.7 KB','created_at_date_time':'2022-08-23 17:12:25 CEST','description':null,'links':{ 'origin_object':{ 'origin_type':'User','origin_uid':'user-5' },'show':'/files/file-GG2Kvf80XVvvgPB2FgvVKBXP-1','user':'/users/precisionfda.admin_dev','track':'/track?id=file-GG2Kvf80XVvvgPB2FgvVKBXP-1','download_list':'/api/files/download_list','attach_to':'/api/attach_to_notes','add_file':'/api/create_file','add_folder':'/api/files/create_folder','update':'/api/files','download':'/api/files/file-GG2Kvf80XVvvgPB2FgvVKBXP-1/download','copy':'/api/files/copy','remove':'/api/files/remove','license':'/api/licenses/:id/license_item/:item_uid','organize':'/api/files/move','feature':'/api/files/feature' },'file_license':{},'show_license_pending':false }],'meta':{ 'links':{ 'copy_private':'/api/files/copy' },'count':2,'pagination':{ 'current_page':1,'next_page':null,'prev_page':null,'total_pages':1,'total_count':2 }}}),
  )),
  rest.get('/api/apps', (re, res, ctx) => res(
    ctx.status(200),
    ctx.json({ 'apps':[],'meta':{ 'links':{ 'copy_private':'/api/apps/copy','create':'/apps/new' },'count':0,'notes':[],'answers':[],'discussions':[],'pagination':{ 'current_page':1,'next_page':null,'prev_page':null,'total_pages':0,'total_count':0 }}}),
  )),
  rest.post('/api/files/download_list', (re, res, ctx) => res(
    ctx.status(200),
    ctx.json([]),
  )),
  rest.get('/api/counters', (re, res, ctx) => res(
    ctx.status(200),
    ctx.json({ 'apps':'2','assets':'0','dbclusters':'0','jobs':1,'files':'0','workflows':'2' }),
  )),
  rest.get('/api/user', (req, res, ctx) => {
    const isAuthenticated = true
    if (!isAuthenticated) {
      return res(
        ctx.status(403),
        ctx.json({
          errorMessage: 'Not authorized',
        }),
      )
    }
    return res(
      ctx.status(200),
      ctx.json({ 'user': { 'id': 5, 'dxuser': 'precisionfda.admin_dev', 'first_name': 'PrecisionFDA', 'last_name': 'Admin - Dev', 'full_name': 'PrecisionFDA Admin - Dev', 'email': 'pkryshenyk-cf+precisionfda.admin_dev@dnanexus.com', 'admin': true, 'counters': { 'files': 0, 'folders': 0, 'apps': 2, 'workflows': 2, 'jobs': 1, 'assets': 0, 'notes': 0 }, 'links': {}, 'is_guest': false, 'gravatar_url': 'https://secure.gravatar.com/avatar/4a93eb40a70557dec9c5b7582da070fb.png?d=retro\u0026r=PG', 'job_limit': 100, 'pricing_map': { 'baseline-2': 0.286, 'baseline-4': 0.572, 'baseline-8': 1.144, 'baseline-16': 2.288, 'baseline-36': 5.148, 'hidisk-2': 0.372, 'hidisk-4': 0.744, 'hidisk-8': 1.488, 'hidisk-16': 2.976, 'hidisk-36': 6.696, 'himem-2': 0.474, 'himem-4': 0.948, 'himem-8': 1.896, 'himem-16': 3.792, 'himem-32': 7.584, 'gpu-8': 10.787, 'db_std1_x2': 0.273, 'db_mem1_x2': 0.967, 'db_mem1_x4': 1.933, 'db_mem1_x8': 3.867, 'db_mem1_x16': 7.733, 'db_mem1_x32': 15.467, 'db_mem1_x48': 23.2, 'db_mem1_x64': 30.933 }, 'resources': ['baseline-2', 'baseline-4', 'hidisk-2', 'hidisk-4', 'himem-2', 'himem-4'], 'total_limit': 200, 'can_administer_site': true, 'can_create_challenges': true, 'can_see_spaces': true, 'review_space_admin': false, 'can_access_notification_preference': false, 'org': { 'id': 4, 'name': "Admin - Dev's org", 'handle': 'pamellaaccounttwo' }}, 'meta': { 'links': { 'space_create': '/api/spaces', 'space_info': '/api/spaces/info', 'accessible_spaces': '/api/spaces/editable_spaces', 'accessible_apps': '/api/list_apps', 'accessible_workflows': '/api/list_workflows', 'accessible_files': '/api/list_files', 'challenge_new': '/challenges/new' }}}),
    )
  }),
]
